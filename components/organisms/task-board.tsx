"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Text, Heading } from "@/components/atoms";
import { TaskCard } from "@/components/molecules/task-card";

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "TODO" | "IN_PROGRESS" | "DONE";
  dueDate?: string;
}

export interface TaskBoardProps {
  tasks: Task[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: "TODO" | "IN_PROGRESS" | "DONE") => void;
}

const STATUSES = [
  { key: "TODO", label: "To Do", bgColor: "bg-blue-50 dark:bg-blue-950" },
  { key: "IN_PROGRESS", label: "In Progress", bgColor: "bg-yellow-50 dark:bg-yellow-950" },
  { key: "DONE", label: "Done", bgColor: "bg-green-50 dark:bg-green-950" },
] as const;

export function TaskBoard({ tasks, onEdit, onDelete, onStatusChange }: TaskBoardProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const getTasksByStatus = (status: string) => tasks.filter((t) => t.status === status);
  const getTaskById = (id: string) => tasks.find((t) => t.id === id);

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, id: string) => {
    event.dataTransfer.setData("text/plain", id);
    event.dataTransfer.effectAllowed = "move";
    setDraggingId(id);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>, status: Task["status"]) => {
    event.preventDefault();
    const id = event.dataTransfer.getData("text/plain");
    if (!id) return;
    const task = getTaskById(id);
    if (!task || task.status === status) return;
    setDraggingId(null);
    onStatusChange(id, status);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {STATUSES.map(({ key, label, bgColor }) => {
        const statusTasks = getTasksByStatus(key);
        return (
          <div
            key={key}
            className={`${bgColor} rounded-lg p-4 space-y-3`}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => handleDrop(event, key)}
          >
            <div className="flex items-center justify-between mb-4">
              <Heading as="h3" size="h4">
                {label}
              </Heading>
              <Text size="sm" weight="semibold" className="text-muted-foreground">
                {statusTasks.length}
              </Text>
            </div>

            <div className="space-y-3 min-h-64">
              {statusTasks.length === 0 ? (
                <Text size="sm" variant="muted" className="text-center py-8">
                  No tasks
                </Text>
              ) : (
                statusTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    {...task}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    draggable
                    onDragStart={(event) => handleDragStart(event, task.id)}
                    onDragEnd={handleDragEnd}
                    isDragging={draggingId === task.id}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
