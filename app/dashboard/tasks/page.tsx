"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/templates/dashboard-layout";
import { Heading, Text } from "@/components/atoms";
import { Input } from "@/components/atoms/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/select";
import { Button } from "@/components/atoms/button";
import { PriorityBadge } from "@/components/molecules/priority-badge";
import { StatusBadge } from "@/components/molecules/status-badge";
import { createClient } from "@/lib/supabase/client";

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "TODO" | "IN_PROGRESS" | "DONE";
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

type StatusFilter = "ALL" | Task["status"];
type PriorityFilter = "ALL" | Task["priority"];
type DueFilter =
  | "ALL"
  | "OVERDUE"
  | "DUE_SOON"
  | "NO_DUE_DATE"
  | "HAS_DUE_DATE";

function formatDate(dateString?: string): string {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isOverdue(dateString?: string): boolean {
  if (!dateString) return false;
  const today = new Date();
  return (
    new Date(dateString) < today &&
    new Date(dateString).toDateString() !== today.toDateString()
  );
}

function isDueSoon(dateString?: string, days = 7): boolean {
  if (!dateString) return false;
  const today = new Date();
  const due = new Date(dateString);
  const diff = due.getTime() - today.getTime();
  return diff >= 0 && diff <= days * 24 * 60 * 60 * 1000;
}

export default function DashboardTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userEmail, setUserEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("ALL");
  const [dueFilter, setDueFilter] = useState<DueFilter>("ALL");
  const [page, setPage] = useState(1);
  const router = useRouter();
  const supabase = createClient();
  const pageSize = 20; // Fixed page size

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

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/tasks");

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        throw new Error(
          errorData.error || `HTTP ${response.status}: Failed to fetch tasks`,
        );
      }

      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const filteredTasks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return tasks
      .filter((task) => {
        if (statusFilter !== "ALL" && task.status !== statusFilter)
          return false;
        if (priorityFilter !== "ALL" && task.priority !== priorityFilter)
          return false;

        if (dueFilter === "OVERDUE")
          return isOverdue(task.dueDate) && task.status !== "DONE";
        if (dueFilter === "DUE_SOON")
          return isDueSoon(task.dueDate) && task.status !== "DONE";
        if (dueFilter === "NO_DUE_DATE") return !task.dueDate;
        if (dueFilter === "HAS_DUE_DATE") return Boolean(task.dueDate);

        return true;
      })
      .filter((task) => {
        if (!query) return true;
        const haystack =
          `${task.title} ${task.description || ""}`.toLowerCase();
        return haystack.includes(query);
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [tasks, searchQuery, statusFilter, priorityFilter, dueFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / pageSize));

  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter, priorityFilter, dueFilter]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const pagedTasks = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredTasks.slice(start, start + pageSize);
  }, [filteredTasks, page, pageSize]);

  const pageNumbers = useMemo(() => {
    const maxButtons = 5;
    let start = Math.max(1, page - Math.floor(maxButtons / 2));
    const end = Math.min(totalPages, start + maxButtons - 1);
    start = Math.max(1, end - maxButtons + 1);

    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }, [page, totalPages]);

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
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <Heading as="h1" size="h2">
            Tasks
          </Heading>
          <Text size="sm" variant="muted">
            Browse and filter every task in one place.
          </Text>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Input
              placeholder="Search tasks"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
          <div className="lg:col-span-2">
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as StatusFilter)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All status</SelectItem>
                <SelectItem value="TODO">To Do</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="DONE">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="lg:col-span-2">
            <Select
              value={priorityFilter}
              onValueChange={(value) =>
                setPriorityFilter(value as PriorityFilter)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All priority</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="lg:col-span-2">
            <Select
              value={dueFilter}
              onValueChange={(value) => setDueFilter(value as DueFilter)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Due date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All due dates</SelectItem>
                <SelectItem value="OVERDUE">Overdue</SelectItem>
                <SelectItem value="DUE_SOON">Due soon</SelectItem>
                <SelectItem value="HAS_DUE_DATE">Has due date</SelectItem>
                <SelectItem value="NO_DUE_DATE">No due date</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-lg border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Task</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Priority</th>
                  <th className="px-4 py-3 font-medium">Due</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {pagedTasks.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6" colSpan={5}>
                      <Text size="sm" variant="muted">
                        No tasks match these filters.
                      </Text>
                    </td>
                  </tr>
                ) : (
                  pagedTasks.map((task) => (
                    <tr key={task.id} className="border-t">
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-1">
                          <Text weight="semibold">{task.title}</Text>
                          {task.description ? (
                            <Text
                              size="xs"
                              variant="muted"
                              className="line-clamp-2"
                            >
                              {task.description}
                            </Text>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={task.status} />
                      </td>
                      <td className="px-4 py-4">
                        <PriorityBadge priority={task.priority} />
                      </td>
                      <td className="px-4 py-4">
                        <Text
                          size="xs"
                          className={
                            isOverdue(task.dueDate) && task.status !== "DONE"
                              ? "text-red-600 font-semibold"
                              : ""
                          }
                        >
                          {formatDate(task.dueDate)}
                        </Text>
                      </td>
                      <td className="px-4 py-4">
                        <Text size="xs" variant="muted">
                          {formatDate(task.createdAt)}
                        </Text>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <Text size="xs" variant="muted">
              Showing{" "}
              {filteredTasks.length === 0 ? 0 : (page - 1) * pageSize + 1}–
              {Math.min(page * pageSize, filteredTasks.length)} of{" "}
              {filteredTasks.length} tasks
            </Text>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {pageNumbers.map((number) => (
                  <Button
                    key={number}
                    variant={number === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPage(number)}
                  >
                    {number}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
