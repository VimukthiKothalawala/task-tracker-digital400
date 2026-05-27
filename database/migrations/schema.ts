import { pgTable, pgSchema, foreignKey, uuid, text, timestamp, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const taskPriority = pgEnum("task_priority", ['LOW', 'MEDIUM', 'HIGH'])
export const taskStatus = pgEnum("task_status", ['TODO', 'IN_PROGRESS', 'DONE'])

const authSchema = pgSchema("auth");

export const authUsers = authSchema.table("users", {
	id: uuid("id").primaryKey().notNull(),
});

export const tasks = pgTable("tasks", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	title: text().notNull(),
	description: text(),
	priority: taskPriority().default('MEDIUM').notNull(),
	status: taskStatus().default('TODO').notNull(),
	dueDate: timestamp("due_date", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [authUsers.id],
			name: "tasks_user_id_fkey"
		}).onDelete("cascade"),
]);
