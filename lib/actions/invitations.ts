import { db } from "@/lib/db";
import { boardInvitations, boardMembers, boards } from "@/database/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "./auth";

export type BoardInvitation = typeof boardInvitations.$inferSelect;

export async function inviteToBoard(boardId: string, email: string) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const normalizedEmail = email.toLowerCase().trim();

    const [board] = await db
      .select()
      .from(boards)
      .where(and(eq(boards.id, boardId), eq(boards.ownerId, user.id)))
      .limit(1);

    if (!board) throw new Error("Board not found or you are not the owner");

    if (normalizedEmail === user.email?.toLowerCase()) {
      throw new Error("You cannot invite yourself");
    }

    // Check existing pending invite
    const [existingInvite] = await db
      .select()
      .from(boardInvitations)
      .where(
        and(
          eq(boardInvitations.boardId, boardId),
          eq(boardInvitations.invitedEmail, normalizedEmail),
          eq(boardInvitations.status, "pending"),
        ),
      )
      .limit(1);

    if (existingInvite)
      throw new Error("This user already has a pending invitation");

    // Check if already a member
    const existingMembers = await db
      .select()
      .from(boardMembers)
      .where(eq(boardMembers.boardId, boardId));

    const alreadyMember = existingMembers.some(
      (m) => m.email.toLowerCase() === normalizedEmail,
    );
    if (alreadyMember) throw new Error("This user is already a board member");

    const [invitation] = await db
      .insert(boardInvitations)
      .values({
        boardId,
        invitedEmail: normalizedEmail,
        invitedBy: user.id,
        inviterEmail: user.email || "",
        boardName: board.name,
        status: "pending",
      })
      .returning();

    return { success: true, data: invitation };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to send invitation",
    };
  }
}

export async function getMyInvitations() {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const invitations = await db
      .select()
      .from(boardInvitations)
      .where(
        and(
          eq(boardInvitations.invitedEmail, user.email?.toLowerCase() || ""),
          eq(boardInvitations.status, "pending"),
        ),
      )
      .orderBy(boardInvitations.createdAt);

    return { success: true, data: invitations };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch invitations",
    };
  }
}

export async function respondToInvitation(
  invitationId: string,
  accept: boolean,
) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const [invitation] = await db
      .select()
      .from(boardInvitations)
      .where(
        and(
          eq(boardInvitations.id, invitationId),
          eq(boardInvitations.invitedEmail, user.email?.toLowerCase() || ""),
          eq(boardInvitations.status, "pending"),
        ),
      )
      .limit(1);

    if (!invitation) throw new Error("Invitation not found");

    await db
      .update(boardInvitations)
      .set({ status: accept ? "accepted" : "declined" })
      .where(eq(boardInvitations.id, invitationId));

    if (accept) {
      await db.insert(boardMembers).values({
        boardId: invitation.boardId,
        userId: user.id,
        email: user.email || "",
        role: "member",
      });
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to respond to invitation",
    };
  }
}
