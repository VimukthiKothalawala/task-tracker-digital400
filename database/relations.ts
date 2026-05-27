import { relations } from "drizzle-orm/relations";
import { authUsers, tasks } from "./schema";

export const tasksRelations = relations(tasks, ({one}) => ({
	authUsers: one(authUsers, {
		fields: [tasks.userId],
		references: [authUsers.id]
	}),
}));

export const authUsersRelations = relations(authUsers, ({many}) => ({
	tasks: many(tasks),
}));