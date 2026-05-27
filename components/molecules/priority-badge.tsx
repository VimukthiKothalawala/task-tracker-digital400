import { Badge } from "@/components/atoms/badge";

export interface PriorityBadgeProps {
  priority: "LOW" | "MEDIUM" | "HIGH";
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const variantMap = {
    LOW: "low",
    MEDIUM: "medium",
    HIGH: "high",
  } as const;

  const labelMap = {
    LOW: "Low",
    MEDIUM: "Medium",
    HIGH: "High",
  } as const;

  return (
    <Badge variant={variantMap[priority]} className="capitalize">
      {labelMap[priority]}
    </Badge>
  );
}
