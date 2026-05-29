import {
  pgTable,
  pgSchema,
  foreignKey,
  uuid,
  text,
  timestamp,
  pgEnum,
  unique,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const taskPriority = pgEnum("task_priority", ["LOW", "MEDIUM", "HIGH"]);
export const taskStatus = pgEnum("task_status", [
  "TODO",
  "IN_PROGRESS",
  "DONE",
]);

const authSchema = pgSchema("auth");

export const authUsers = authSchema.table("users", {
  id: uuid("id").primaryKey().notNull(),
});

export const boards = pgTable(
  "boards",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    description: text("description"),
    ownerId: uuid("owner_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.ownerId],
      foreignColumns: [authUsers.id],
      name: "boards_owner_id_fkey",
    }).onDelete("cascade"),
  ],
);

export const boardMembers = pgTable(
  "board_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    boardId: uuid("board_id").notNull(),
    userId: uuid("user_id").notNull(),
    email: text("email").notNull(),
    role: text("role").notNull().default("member"),
    joinedAt: timestamp("joined_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.boardId],
      foreignColumns: [boards.id],
      name: "board_members_board_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [authUsers.id],
      name: "board_members_user_id_fkey",
    }).onDelete("cascade"),
    unique("board_members_board_user_unique").on(table.boardId, table.userId),
  ],
);

export const boardInvitations = pgTable(
  "board_invitations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    boardId: uuid("board_id").notNull(),
    invitedEmail: text("invited_email").notNull(),
    invitedBy: uuid("invited_by").notNull(),
    inviterEmail: text("inviter_email").notNull(),
    boardName: text("board_name").notNull(),
    status: text("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.boardId],
      foreignColumns: [boards.id],
      name: "board_invitations_board_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.invitedBy],
      foreignColumns: [authUsers.id],
      name: "board_invitations_invited_by_fkey",
    }).onDelete("cascade"),
  ],
);

export const tasks = pgTable(
  "tasks",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    userId: uuid("user_id").notNull(),
    boardId: uuid("board_id"),
    title: text().notNull(),
    description: text(),
    priority: taskPriority().default("MEDIUM").notNull(),
    status: taskStatus().default("TODO").notNull(),
    dueDate: timestamp("due_date", { withTimezone: true, mode: "string" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [authUsers.id],
      name: "tasks_user_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.boardId],
      foreignColumns: [boards.id],
      name: "tasks_board_id_fkey",
    }).onDelete("cascade"),
  ],
);
