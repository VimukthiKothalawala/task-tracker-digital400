import { relations } from "drizzle-orm/relations";
import { usersInAuth, tasks } from "./schema";

export const tasksRelations = relations(tasks, ({one}) => ({
	usersInAuth: one(usersInAuth, {
		fields: [tasks.userId],
		references: [usersInAuth.id]
	}),
}));

export const usersInAuthRelations = relations(usersInAuth, ({many}) => ({
	tasks: many(tasks),
}));