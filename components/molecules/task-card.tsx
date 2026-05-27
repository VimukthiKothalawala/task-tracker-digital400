import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Text, Heading } from "@/components/atoms";
import { PriorityBadge } from "./priority-badge";
import { StatusBadge } from "./status-badge";
import { MoreVertical, Trash2, Edit2 } from "lucide-react";

export interface TaskCardProps {
  id: string;
  title: string;
  description?: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "TODO" | "IN_PROGRESS" | "DONE";
  dueDate?: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  draggable?: boolean;
  onDragStart?: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd?: (event: React.DragEvent<HTMLDivElement>) => void;
  isDragging?: boolean;
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
  draggable,
  onDragStart,
  onDragEnd,
  isDragging,
}: TaskCardProps) {
  const overdue = isOverdue(dueDate);

  return (
    <Card
      className={`hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing ${
        isDragging ? "opacity-60" : ""
      }`}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <Heading as="h3" size="h4" className="truncate">
              {title}
            </Heading>
          </div>
          <div className="flex items-center gap-2">
            <PriorityBadge priority={priority} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Open actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(id)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(id)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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

      </CardContent>
    </Card>
  );
}
