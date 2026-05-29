"use client";

import { Button } from "@/components/atoms/button";
import { Text } from "@/components/atoms";
import { Mail } from "lucide-react";

export interface InvitationCardProps {
  id: string;
  boardName: string;
  inviterEmail: string;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  isLoading?: boolean;
}

export function InvitationCard({
  id,
  boardName,
  inviterEmail,
  onAccept,
  onDecline,
  isLoading = false,
}: InvitationCardProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
          <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <Text size="sm" weight="semibold">
            Invitation to &quot;{boardName}&quot;
          </Text>
          <Text size="sm" variant="muted">
            {inviterEmail} invited you to collaborate
          </Text>
        </div>
      </div>
      <div className="flex gap-2 sm:shrink-0">
        <Button size="sm" onClick={() => onAccept(id)} disabled={isLoading}>
          Accept
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onDecline(id)}
          disabled={isLoading}
        >
          Decline
        </Button>
      </div>
    </div>
  );
}
