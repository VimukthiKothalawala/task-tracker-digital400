import { Badge } from "@/components/atoms/badge";

export interface StatusBadgeProps {
  status: "TODO" | "IN_PROGRESS" | "DONE";
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const variantMap = {
    TODO: "todo",
    IN_PROGRESS: "inProgress",
    DONE: "done",
  } as const;

  const labelMap = {
    TODO: "To Do",
    IN_PROGRESS: "In Progress",
    DONE: "Done",
  } as const;

  return (
    <Badge variant={variantMap[status]} className="capitalize">
      {labelMap[status]}
    </Badge>
  );
}
