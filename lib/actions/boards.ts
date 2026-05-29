import { db } from "@/lib/db";
import {
  boards,
  boardMembers,
  boardInvitations,
  tasks,
} from "@/database/schema";
import { eq, and, inArray, isNull } from "drizzle-orm";
import { getCurrentUser } from "./auth";

export type Board = typeof boards.$inferSelect;
export type BoardMember = typeof boardMembers.$inferSelect;

async function isBoardOwner(boardId: string, userId: string) {
  const result = await db
    .select({ id: boards.id })
    .from(boards)
    .where(and(eq(boards.id, boardId), eq(boards.ownerId, userId)))
    .limit(1);
  return result.length > 0;
}

export async function isBoardMember(boardId: string, userId: string) {
  const result = await db
    .select({ id: boardMembers.id })
    .from(boardMembers)
    .where(
      and(eq(boardMembers.boardId, boardId), eq(boardMembers.userId, userId)),
    )
    .limit(1);
  return result.length > 0;
}

export async function getBoards() {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const memberships = await db
      .select({ boardId: boardMembers.boardId })
      .from(boardMembers)
      .where(eq(boardMembers.userId, user.id));

    if (memberships.length === 0) return { success: true, data: [] as Board[] };

    const boardIds = memberships.map((m) => m.boardId);
    const userBoards = await db
      .select()
      .from(boards)
      .where(inArray(boards.id, boardIds))
      .orderBy(boards.createdAt);

    return { success: true, data: userBoards };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch boards",
    };
  }
}

export async function createBoard(name: string, description?: string) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const [board] = await db
      .insert(boards)
      .values({ name, description, ownerId: user.id })
      .returning();

    await db.insert(boardMembers).values({
      boardId: board.id,
      userId: user.id,
      email: user.email || "",
      role: "owner",
    });

    return { success: true, data: board };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create board",
    };
  }
}

export async function updateBoard(
  id: string,
  data: { name?: string; description?: string },
) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");
    if (!(await isBoardOwner(id, user.id))) throw new Error("Unauthorized");

    const [board] = await db
      .update(boards)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(boards.id, id))
      .returning();

    if (data.name) {
      await db
        .update(boardInvitations)
        .set({ boardName: data.name })
        .where(eq(boardInvitations.boardId, id));
    }

    return { success: true, data: board };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update board",
    };
  }
}

export async function deleteBoard(id: string) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");
    if (!(await isBoardOwner(id, user.id))) throw new Error("Unauthorized");

    const [board] = await db
      .delete(boards)
      .where(eq(boards.id, id))
      .returning();

    return { success: true, data: board };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete board",
    };
  }
}

export async function getBoardMembers(boardId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");
    if (!(await isBoardMember(boardId, user.id)))
      throw new Error("Unauthorized");

    const members = await db
      .select()
      .from(boardMembers)
      .where(eq(boardMembers.boardId, boardId))
      .orderBy(boardMembers.joinedAt);

    return { success: true, data: members };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch members",
    };
  }
}

export async function removeBoardMember(boardId: string, userId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");
    if (!(await isBoardOwner(boardId, user.id)))
      throw new Error("Unauthorized");
    if (userId === user.id) throw new Error("Cannot remove the board owner");

    await db
      .delete(boardMembers)
      .where(
        and(eq(boardMembers.boardId, boardId), eq(boardMembers.userId, userId)),
      );

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to remove member",
    };
  }
}

export async function ensureDefaultBoard() {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const existing = await db
      .select({ id: boardMembers.id })
      .from(boardMembers)
      .where(eq(boardMembers.userId, user.id))
      .limit(1);

    if (existing.length > 0) return { success: true, created: false };

    const [board] = await db
      .insert(boards)
      .values({ name: "My Board", ownerId: user.id })
      .returning();

    await db.insert(boardMembers).values({
      boardId: board.id,
      userId: user.id,
      email: user.email || "",
      role: "owner",
    });

    // Migrate any legacy tasks (no boardId) to the default board
    await db
      .update(tasks)
      .set({ boardId: board.id })
      .where(and(eq(tasks.userId, user.id), isNull(tasks.boardId)));

    return { success: true, created: true, data: board };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to set up default board",
    };
  }
}
