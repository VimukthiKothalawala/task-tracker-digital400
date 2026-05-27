import { relations } from "drizzle-orm/relations";
import { authUsers, tasks } from "./schema";

export const tasksRelations = relations(tasks, ({ one }) => ({
	users: one(authUsers, {
		fields: [tasks.userId],
		references: [authUsers.id]
	}),
}));

export const usersRelations = relations(authUsers, ({ many }) => ({
	tasks: many(tasks),
}));