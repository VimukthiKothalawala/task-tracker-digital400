import { relations } from "drizzle-orm/relations";
import {
  authUsers,
  tasks,
  boards,
  boardMembers,
  boardInvitations,
} from "./schema";

export const tasksRelations = relations(tasks, ({ one }) => ({
  authUsers: one(authUsers, {
    fields: [tasks.userId],
    references: [authUsers.id],
  }),
  board: one(boards, {
    fields: [tasks.boardId],
    references: [boards.id],
  }),
}));

export const authUsersRelations = relations(authUsers, ({ many }) => ({
  tasks: many(tasks),
  ownedBoards: many(boards),
  boardMemberships: many(boardMembers),
  sentInvitations: many(boardInvitations),
}));

export const boardsRelations = relations(boards, ({ one, many }) => ({
  owner: one(authUsers, {
    fields: [boards.ownerId],
    references: [authUsers.id],
  }),
  members: many(boardMembers),
  invitations: many(boardInvitations),
  tasks: many(tasks),
}));

export const boardMembersRelations = relations(boardMembers, ({ one }) => ({
  board: one(boards, {
    fields: [boardMembers.boardId],
    references: [boards.id],
  }),
  user: one(authUsers, {
    fields: [boardMembers.userId],
    references: [authUsers.id],
  }),
}));

export const boardInvitationsRelations = relations(
  boardInvitations,
  ({ one }) => ({
    board: one(boards, {
      fields: [boardInvitations.boardId],
      references: [boards.id],
    }),
    inviter: one(authUsers, {
      fields: [boardInvitations.invitedBy],
      references: [authUsers.id],
    }),
  }),
);
