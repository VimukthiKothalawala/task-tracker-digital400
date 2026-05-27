import { db } from "@/lib/db";
import { tasks } from "@/database/schema";
import { eq, and, lt } from "drizzle-orm";
import { getCurrentUser } from "./auth";

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

    const result = await db
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

    return { success: true, data: result[0] };
  } catch (error) {
    console.error("createTask error:", error);
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

    const result = await db
      .update(tasks)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(and(eq(tasks.id, id), eq(tasks.userId, user.id)))
      .returning();

    if (!result.length) throw new Error("Task not found");
    return { success: true, data: result[0] };
  } catch (error) {
    console.error("updateTask error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update task",
    };
  }
}

export async function deleteTask(id: string) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const result = await db
      .delete(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.userId, user.id)))
      .returning();

    if (!result.length) throw new Error("Task not found");
    return { success: true, data: result[0] };
  } catch (error) {
    console.error("deleteTask error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete task",
    };
  }
}

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
