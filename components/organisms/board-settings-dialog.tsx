"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/atoms/dialog";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Heading, Text } from "@/components/atoms";
import { UserAvatar } from "@/components/molecules/user-avatar";
import { Trash2, UserMinus, Send, Crown } from "lucide-react";

export interface BoardMember {
  id: string;
  userId: string;
  email: string;
  role: string;
  joinedAt: string;
}

export interface BoardSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boardName: string;
  isOwner: boolean;
  members: BoardMember[];
  currentUserId: string;
  onRename: (name: string) => Promise<void>;
  onInvite: (email: string) => Promise<void>;
  onRemoveMember: (userId: string) => Promise<void>;
  onDelete: () => Promise<void>;
}

export function BoardSettingsDialog({
  open,
  onOpenChange,
  boardName,
  isOwner,
  members,
  currentUserId,
  onRename,
  onInvite,
  onRemoveMember,
  onDelete,
}: BoardSettingsDialogProps) {
  const [name, setName] = useState(boardName);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");
  const [nameError, setNameError] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleRename = async () => {
    if (!name.trim()) {
      setNameError("Board name is required");
      return;
    }
    if (name.trim() === boardName) return;

    try {
      setIsSavingName(true);
      setNameError("");
      await onRename(name.trim());
    } catch (error) {
      setNameError(
        error instanceof Error ? error.message : "Failed to rename board",
      );
    } finally {
      setIsSavingName(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      setInviteError("Email is required");
      return;
    }

    try {
      setIsInviting(true);
      setInviteError("");
      setInviteSuccess("");
      await onInvite(inviteEmail.trim());
      setInviteEmail("");
      setInviteSuccess("Invitation sent!");
      setTimeout(() => setInviteSuccess(""), 3000);
    } catch (error) {
      setInviteError(
        error instanceof Error ? error.message : "Failed to send invitation",
      );
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      setRemovingUserId(userId);
      await onRemoveMember(userId);
    } finally {
      setRemovingUserId(null);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    try {
      setIsDeleting(true);
      await onDelete();
      onOpenChange(false);
    } finally {
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) setConfirmDelete(false);
      }}
    >
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Board Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Board Name */}
          {isOwner && (
            <div className="space-y-2">
              <Heading as="h3" size="h4">
                Board Name
              </Heading>
              <div className="flex gap-2">
                <Input
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setNameError("");
                  }}
                  placeholder="Board name"
                  disabled={isSavingName}
                />
                <Button
                  size="sm"
                  onClick={handleRename}
                  disabled={isSavingName || name.trim() === boardName}
                >
                  Save
                </Button>
              </div>
              {nameError && (
                <Text size="sm" className="text-red-600">
                  {nameError}
                </Text>
              )}
            </div>
          )}

          {/* Members */}
          <div className="space-y-3">
            <Heading as="h3" size="h4">
              Members ({members.length})
            </Heading>
            <div className="space-y-2">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    <UserAvatar email={member.email} size="sm" />
                    <div>
                      <Text size="sm" weight="medium">
                        {member.email}
                        {member.userId === currentUserId && (
                          <span className="ml-1 text-muted-foreground font-normal">
                            (you)
                          </span>
                        )}
                      </Text>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {member.role === "owner" && (
                      <Crown className="w-3.5 h-3.5 text-yellow-500" />
                    )}
                    {isOwner && member.userId !== currentUserId && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-red-600"
                        onClick={() => handleRemoveMember(member.userId)}
                        disabled={removingUserId === member.userId}
                        title="Remove member"
                      >
                        <UserMinus className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Invite */}
          {isOwner && (
            <div className="space-y-2">
              <Heading as="h3" size="h4">
                Invite Collaborator
              </Heading>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="colleague@example.com"
                  value={inviteEmail}
                  onChange={(e) => {
                    setInviteEmail(e.target.value);
                    setInviteError("");
                  }}
                  disabled={isInviting}
                  onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                />
                <Button
                  size="sm"
                  onClick={handleInvite}
                  disabled={isInviting || !inviteEmail.trim()}
                >
                  <Send className="w-3.5 h-3.5 mr-1" />
                  Invite
                </Button>
              </div>
              {inviteError && (
                <Text size="sm" className="text-red-600">
                  {inviteError}
                </Text>
              )}
              {inviteSuccess && (
                <Text size="sm" className="text-green-600">
                  {inviteSuccess}
                </Text>
              )}
            </div>
          )}

          {/* Delete Board */}
          {isOwner && (
            <div className="border-t pt-4 space-y-2">
              <Heading as="h3" size="h4" className="text-red-600">
                Danger Zone
              </Heading>
              {confirmDelete ? (
                <div className="space-y-2">
                  <Text size="sm" variant="muted">
                    This will permanently delete the board and all its tasks.
                    Are you sure?
                  </Text>
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      {isDeleting ? "Deleting..." : "Yes, delete board"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setConfirmDelete(false)}
                      disabled={isDeleting}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button variant="destructive" size="sm" onClick={handleDelete}>
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  Delete Board
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
