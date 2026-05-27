import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Text, Heading } from "@/components/atoms";
import { PriorityBadge } from "./priority-badge";
import { StatusBadge } from "./status-badge";
import { Trash2, Edit2 } from "lucide-react";

export interface TaskCardProps {
  id: string;
  title: string;
  description?: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "TODO" | "IN_PROGRESS" | "DONE";
  dueDate?: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: "TODO" | "IN_PROGRESS" | "DONE") => void;
}

function formatDate(dateString?: string): string {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isOverdue(dateString?: string): boolean {
  if (!dateString) return false;
  return new Date(dateString) < new Date() && new Date(dateString).toDateString() !== new Date().toDateString();
}

export function TaskCard({
  id,
  title,
  description,
  priority,
  status,
  dueDate,
  onEdit,
  onDelete,
  onStatusChange,
}: TaskCardProps) {
  const overdue = isOverdue(dueDate);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <Heading as="h3" size="h4" className="truncate">
              {title}
            </Heading>
          </div>
          <PriorityBadge priority={priority} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {description && (
          <Text size="sm" variant="muted" className="line-clamp-2">
            {description}
          </Text>
        )}

        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex gap-2 items-center">
            <StatusBadge status={status} />
            {dueDate && (
              <Text size="xs" variant={overdue ? "muted" : "default"} className={overdue ? "text-red-600 font-semibold" : ""}>
                {overdue ? "🔴 " : ""}{formatDate(dueDate)}
              </Text>
            )}
          </div>
        </div>

        <div className="flex gap-2 pt-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(id)}
            className="flex-1"
          >
            <Edit2 className="w-4 h-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(id)}
            className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </Button>
        </div>

        <div className="flex gap-2 pt-2 border-t">
          {status !== "TODO" && (
            <Button
              variant="outline"
              size="xs"
              onClick={() => onStatusChange(id, "TODO")}
              className="flex-1"
            >
              To Do
            </Button>
          )}
          {status !== "IN_PROGRESS" && (
            <Button
              variant="outline"
              size="xs"
              onClick={() => onStatusChange(id, "IN_PROGRESS")}
              className="flex-1"
            >
              In Progress
            </Button>
          )}
          {status !== "DONE" && (
            <Button
              variant="outline"
              size="xs"
              onClick={() => onStatusChange(id, "DONE")}
              className="flex-1"
            >
              Done
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
