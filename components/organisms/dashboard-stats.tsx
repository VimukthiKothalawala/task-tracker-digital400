import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Text, Heading } from "@/components/atoms";

export interface DashboardStatsProps {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
  overdue: number;
}

export function DashboardStats({
  total,
  todo,
  inProgress,
  done,
  overdue,
}: DashboardStatsProps) {
  const stats = [
    {
      label: "Total Tasks",
      value: total,
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    },
    {
      label: "To Do",
      value: todo,
      color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    },
    {
      label: "In Progress",
      value: inProgress,
      color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    },
    {
      label: "Done",
      value: done,
      color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    },
    {
      label: "🔴 Overdue",
      value: overdue,
      color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      highlight: overdue > 0,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className={stat.highlight ? "ring-2 ring-red-500" : ""}>
          <CardHeader className="pb-2">
            <Text size="sm" weight="medium" variant="muted">
              {stat.label}
            </Text>
          </CardHeader>
          <CardContent>
            <div className={`inline-block rounded-lg px-3 py-1 ${stat.color}`}>
              <Text as="div" size="lg" weight="bold">
                {stat.value}
              </Text>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
