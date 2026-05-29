import { db } from "@/lib/db";
import { tasks, boardMembers } from "@/database/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "./auth";

const ERR_UPDATE = "Failed to update task";
const ERR_DELETE = "Failed to delete task";
const ERR_NOT_FOUND = "Task not found";

async function checkBoardAccess(boardId: string, userId: string) {
  const result = await db
    .select({ id: boardMembers.id })
    .from(boardMembers)
    .where(
      and(eq(boardMembers.boardId, boardId), eq(boardMembers.userId, userId)),
    )
    .limit(1);
  return result.length > 0;
}

// Legacy: returns all tasks owned by the user (no board scope)
export async function getTasks() {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const userTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, user.id))
      .orderBy(tasks.createdAt);

    return { success: true, data: userTasks };
  } catch (error) {
    console.error("getTasks error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch tasks",
    };
  }
}

export async function getBoardTasks(boardId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    if (!(await checkBoardAccess(boardId, user.id)))
      throw new Error("Unauthorized");

    const boardTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.boardId, boardId))
      .orderBy(tasks.createdAt);

    return { success: true, data: boardTasks };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch tasks",
    };
  }
}

// Legacy create (no board)
export async function createTask(
  title: string,
  description: string,
  priority: "LOW" | "MEDIUM" | "HIGH",
  status: "TODO" | "IN_PROGRESS" | "DONE",
  dueDate?: string,
) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const [result] = await db
      .insert(tasks)
      .values({
        title,
        description,
        priority,
        status,
        dueDate,
        userId: user.id,
      })
      .returning();

    return { success: true, data: result };
  } catch (error) {
    console.error("createTask error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create task",
    };
  }
}

export async function createBoardTask(
  boardId: string,
  title: string,
  description: string,
  priority: "LOW" | "MEDIUM" | "HIGH",
  status: "TODO" | "IN_PROGRESS" | "DONE",
  dueDate?: string,
) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    if (!(await checkBoardAccess(boardId, user.id)))
      throw new Error("Unauthorized");

    const [result] = await db
      .insert(tasks)
      .values({
        title,
        description,
        priority,
        status,
        dueDate,
        userId: user.id,
        boardId,
      })
      .returning();

    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create task",
    };
  }
}

export async function updateTask(
  id: string,
  data: Partial<{
    title: string;
    description: string;
    priority: "LOW" | "MEDIUM" | "HIGH";
    status: "TODO" | "IN_PROGRESS" | "DONE";
    dueDate?: string;
  }>,
) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const [existing] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, id))
      .limit(1);

    if (!existing) throw new Error(ERR_NOT_FOUND);

    if (existing.boardId) {
      if (!(await checkBoardAccess(existing.boardId, user.id)))
        throw new Error("Unauthorized");
    } else if (existing.userId !== user.id) {
      throw new Error("Unauthorized");
    }

    const [result] = await db
      .update(tasks)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(tasks.id, id))
      .returning();

    if (!result) throw new Error(ERR_NOT_FOUND);
    return { success: true, data: result };
  } catch (error) {
    console.error("updateTask error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : ERR_UPDATE,
    };
  }
}

export async function deleteTask(id: string) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const [existing] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, id))
      .limit(1);

    if (!existing) throw new Error(ERR_NOT_FOUND);

    if (existing.boardId) {
      if (!(await checkBoardAccess(existing.boardId, user.id)))
        throw new Error("Unauthorized");
    } else if (existing.userId !== user.id) {
      throw new Error("Unauthorized");
    }

    const [result] = await db.delete(tasks).where(eq(tasks.id, id)).returning();

    if (!result) throw new Error(ERR_NOT_FOUND);
    return { success: true, data: result };
  } catch (error) {
    console.error("deleteTask error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : ERR_DELETE,
    };
  }
}

// Legacy stats
export async function getTaskStats() {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const allTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, user.id));

    const now = new Date();

    return {
      success: true,
      data: {
        total: allTasks.length,
        todo: allTasks.filter((t) => t.status === "TODO").length,
        inProgress: allTasks.filter((t) => t.status === "IN_PROGRESS").length,
        done: allTasks.filter((t) => t.status === "DONE").length,
        overdue: allTasks.filter(
          (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== "DONE",
        ).length,
      },
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get task stats",
    };
  }
}

export async function getBoardTaskStats(boardId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    if (!(await checkBoardAccess(boardId, user.id)))
      throw new Error("Unauthorized");

    const allTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.boardId, boardId));

    const now = new Date();

    return {
      success: true,
      data: {
        total: allTasks.length,
        todo: allTasks.filter((t) => t.status === "TODO").length,
        inProgress: allTasks.filter((t) => t.status === "IN_PROGRESS").length,
        done: allTasks.filter((t) => t.status === "DONE").length,
        overdue: allTasks.filter(
          (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== "DONE",
        ).length,
      },
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get task stats",
    };
  }
}
