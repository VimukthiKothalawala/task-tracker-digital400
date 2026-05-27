"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/templates/dashboard-layout";
import { TaskBoard } from "@/components/organisms/task-board";
import { DashboardStats } from "@/components/organisms/dashboard-stats";
import { Button } from "@/components/ui/button";
import { Heading, Text } from "@/components/atoms";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TaskForm, TaskFormData } from "@/components/organisms/task-form";
import { createClient } from "@/lib/supabase/client";
import { Plus } from "lucide-react";

interface Task extends TaskFormData {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userEmail, setUserEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    todo: 0,
    inProgress: 0,
    done: 0,
    overdue: 0,
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUserEmail(user.email || "");
      fetchTasks();
    };

    checkAuth();
  }, []);

  const fetchTasks = async (options?: { showLoading?: boolean }) => {
    try {
      if (options?.showLoading !== false) {
        setIsLoading(true);
      }
      const response = await fetch("/api/tasks");
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch tasks`);
      }
      
      const data = await response.json();
      setTasks(data);
      updateStats(data);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      // You can add a toast notification here for user feedback
    } finally {
      if (options?.showLoading !== false) {
        setIsLoading(false);
      }
    }
  };

  const updateStats = (taskList: Task[]) => {
    const now = new Date();
    const overdue = taskList.filter(
      (t) =>
        t.dueDate &&
        new Date(t.dueDate) < now &&
        t.status !== "DONE"
    ).length;

    setStats({
      total: taskList.length,
      todo: taskList.filter((t) => t.status === "TODO").length,
      inProgress: taskList.filter((t) => t.status === "IN_PROGRESS").length,
      done: taskList.filter((t) => t.status === "DONE").length,
      overdue,
    });
  };

  const handleCreateTask = async (formData: TaskFormData) => {
    try {
      setIsSubmitting(true);
      
      // Clean up form data: convert empty dueDate to undefined
      const cleanedData = {
        ...formData,
        dueDate: formData.dueDate?.trim() ? formData.dueDate : undefined,
      };
      
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanedData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || `Failed to create task (${response.status})`);
      }

      await fetchTasks();
      setIsFormOpen(false);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Failed to create task"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTask = async (formData: TaskFormData) => {
    if (!editingTask?.id) return;

    try {
      setIsSubmitting(true);
      
      // Clean up form data: convert empty dueDate to undefined
      const cleanedData = {
        ...formData,
        dueDate: formData.dueDate?.trim() ? formData.dueDate : undefined,
      };
      
      const response = await fetch(`/api/tasks/${editingTask.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanedData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || `Failed to update task (${response.status})`);
      }

      await fetchTasks();
      setIsFormOpen(false);
      setEditingTask(null);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Failed to update task"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete task");

      await fetchTasks();
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const handleStatusChange = async (
    id: string,
    status: "TODO" | "IN_PROGRESS" | "DONE"
  ) => {
    const previousTasks = tasks;
    const nextTasks = tasks.map((task) =>
      task.id === id ? { ...task, status, updatedAt: new Date().toISOString() } : task
    );

    setTasks(nextTasks);
    updateStats(nextTasks);

    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error("Failed to update task");

      fetchTasks({ showLoading: false });
    } catch (error) {
      setTasks(previousTasks);
      updateStats(previousTasks);
      console.error("Failed to update task status:", error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (isLoading) {
    return (
      <DashboardLayout userEmail={userEmail} onLogout={handleLogout}>
        <div className="flex items-center justify-center min-h-96">
          <Text>Loading...</Text>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userEmail={userEmail} onLogout={handleLogout}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Heading as="h1" size="h2">
              Dashboard
            </Heading>
            <Text size="sm" variant="muted" className="mt-1">
              Welcome back! Manage your tasks efficiently.
            </Text>
          </div>
          <Button
            onClick={() => {
              setEditingTask(null);
              setIsFormOpen(true);
            }}
            className="w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
        </div>

        {/* Stats */}
        <DashboardStats {...stats} />

        {/* Task Board */}
        <div>
          <Heading as="h2" size="h3" className="mb-4">
            Tasks
          </Heading>
          <TaskBoard
            tasks={tasks}
            onEdit={(id) => {
              const task = tasks.find((t) => t.id === id);
              if (task) {
                setEditingTask(task);
                setIsFormOpen(true);
              }
            }}
            onDelete={handleDeleteTask}
            onStatusChange={handleStatusChange}
          />
        </div>
      </div>

      {/* Task Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingTask ? "Edit Task" : "Create New Task"}
            </DialogTitle>
          </DialogHeader>
          <TaskForm
            initialData={editingTask || undefined}
            onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingTask(null);
            }}
            isLoading={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
