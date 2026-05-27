import { relations } from "drizzle-orm/relations";
import { users, tasks } from "./schema";

export const tasksRelations = relations(tasks, ({one}) => ({
	users: one(users, {
		fields: [tasks.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	tasks: many(tasks),
}));