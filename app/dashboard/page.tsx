"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/templates/dashboard-layout";
import { TaskBoard } from "@/components/organisms/task-board";
import { DashboardStats } from "@/components/organisms/dashboard-stats";
import { BoardSettingsDialog } from "@/components/organisms/board-settings-dialog";
import { InvitationCard } from "@/components/molecules/invitation-card";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Heading, Text } from "@/components/atoms";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/atoms/dialog";
import { TaskForm, TaskFormData } from "@/components/organisms/task-form";
import { createClient } from "@/lib/supabase/client";
import { Plus, Settings } from "lucide-react";

const FAILED_UPDATE_TASK = "Failed to update task";

interface Task extends TaskFormData {
  id: string;
  boardId?: string;
  createdAt: string;
  updatedAt: string;
}

interface Board {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

interface BoardMember {
  id: string;
  userId: string;
  email: string;
  role: string;
  joinedAt: string;
}

interface Invitation {
  id: string;
  boardId: string;
  boardName: string;
  inviterEmail: string;
  invitedEmail: string;
  status: string;
  createdAt: string;
}

export default function DashboardPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<BoardMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [userId, setUserId] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    todo: 0,
    inProgress: 0,
    done: 0,
    overdue: 0,
  });

  // Task form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Board creation state
  const [isNewBoardOpen, setIsNewBoardOpen] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [newBoardError, setNewBoardError] = useState("");
  const [isCreatingBoard, setIsCreatingBoard] = useState(false);

  // Board settings state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Invitation response loading
  const [respondingInviteId, setRespondingInviteId] = useState<string | null>(
    null,
  );

  const router = useRouter();
  const supabase = createClient();

  const selectedBoard = boards.find((b) => b.id === selectedBoardId) ?? null;
  const isOwner = selectedBoard?.ownerId === userId;

  const updateStats = (taskList: Task[]) => {
    const now = new Date();
    setStats({
      total: taskList.length,
      todo: taskList.filter((t) => t.status === "TODO").length,
      inProgress: taskList.filter((t) => t.status === "IN_PROGRESS").length,
      done: taskList.filter((t) => t.status === "DONE").length,
      overdue: taskList.filter(
        (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== "DONE",
      ).length,
    });
  };

  const fetchBoardTasks = useCallback(
    async (boardId: string, options?: { showLoading?: boolean }) => {
      if (options?.showLoading !== false) setIsLoading(true);
      try {
        const response = await fetch(`/api/boards/${boardId}/tasks`);
        if (!response.ok) throw new Error("Failed to fetch tasks");
        const data = await response.json();
        setTasks(data);
        updateStats(data);
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      } finally {
        if (options?.showLoading !== false) setIsLoading(false);
      }
    },
    [],
  );

  const fetchMembers = useCallback(async (boardId: string) => {
    try {
      const response = await fetch(`/api/boards/${boardId}/members`);
      if (!response.ok) return;
      const data = await response.json();
      setMembers(data);
    } catch {
      // non-critical
    }
  }, []);

  const fetchInvitations = useCallback(async () => {
    try {
      const response = await fetch("/api/invitations");
      if (!response.ok) return;
      const data = await response.json();
      setInvitations(data);
    } catch {
      // non-critical
    }
  }, []);

  const fetchBoards = useCallback(async () => {
    try {
      const response = await fetch("/api/boards");
      if (!response.ok) throw new Error("Failed to fetch boards");
      const data: Board[] = await response.json();
      return data;
    } catch {
      return [];
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUserId(user.id);
      setUserEmail(user.email || "");

      // Ensure at least one default board exists (migrates legacy tasks too)
      await fetch("/api/boards/ensure-default", { method: "POST" });

      const [boardList] = await Promise.all([
        fetchBoards(),
        fetchInvitations(),
      ]);

      setBoards(boardList);

      if (boardList.length > 0) {
        const firstId = boardList[0].id;
        setSelectedBoardId(firstId);
        await Promise.all([fetchBoardTasks(firstId), fetchMembers(firstId)]);
      } else {
        setIsLoading(false);
      }
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When board selection changes, load tasks & members
  const handleSelectBoard = async (boardId: string) => {
    setSelectedBoardId(boardId);
    setTasks([]);
    setStats({ total: 0, todo: 0, inProgress: 0, done: 0, overdue: 0 });
    await Promise.all([fetchBoardTasks(boardId), fetchMembers(boardId)]);
  };

  const handleCreateBoard = async () => {
    if (!newBoardName.trim()) {
      setNewBoardError("Board name is required");
      return;
    }
    try {
      setIsCreatingBoard(true);
      setNewBoardError("");
      const response = await fetch("/api/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newBoardName.trim() }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to create board");
      }
      const board: Board = await response.json();
      setBoards((prev) => [...prev, board]);
      setIsNewBoardOpen(false);
      setNewBoardName("");
      await handleSelectBoard(board.id);
    } catch (error) {
      setNewBoardError(
        error instanceof Error ? error.message : "Failed to create board",
      );
    } finally {
      setIsCreatingBoard(false);
    }
  };

  const handleRenameBoard = async (name: string) => {
    if (!selectedBoardId) return;
    const response = await fetch(`/api/boards/${selectedBoardId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Failed to rename board");
    }
    const updated: Board = await response.json();
    setBoards((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
  };

  const handleDeleteBoard = async () => {
    if (!selectedBoardId) return;
    const response = await fetch(`/api/boards/${selectedBoardId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Failed to delete board");
    }
    const remaining = boards.filter((b) => b.id !== selectedBoardId);
    setBoards(remaining);
    setIsSettingsOpen(false);
    if (remaining.length > 0) {
      await handleSelectBoard(remaining[0].id);
    } else {
      setSelectedBoardId(null);
      setTasks([]);
      setStats({ total: 0, todo: 0, inProgress: 0, done: 0, overdue: 0 });
    }
  };

  const handleInvite = async (email: string) => {
    if (!selectedBoardId) return;
    const response = await fetch(`/api/boards/${selectedBoardId}/invitations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Failed to send invitation");
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!selectedBoardId) return;
    const response = await fetch(`/api/boards/${selectedBoardId}/members`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: memberId }),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Failed to remove member");
    }
    setMembers((prev) => prev.filter((m) => m.userId !== memberId));
  };

  const handleRespondInvitation = async (id: string, accept: boolean) => {
    try {
      setRespondingInviteId(id);
      const response = await fetch(`/api/invitations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accept }),
      });
      if (!response.ok) throw new Error("Failed to respond");

      setInvitations((prev) => prev.filter((inv) => inv.id !== id));

      if (accept) {
        // Refresh boards to include the newly joined one
        const updated = await fetchBoards();
        setBoards(updated);
      }
    } catch (error) {
      console.error("Failed to respond to invitation:", error);
    } finally {
      setRespondingInviteId(null);
    }
  };

  const handleCreateTask = async (formData: TaskFormData) => {
    if (!selectedBoardId) return;
    try {
      setIsSubmitting(true);
      const cleanedData = {
        ...formData,
        dueDate: formData.dueDate?.trim() ? formData.dueDate : undefined,
      };
      const response = await fetch(`/api/boards/${selectedBoardId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanedData),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to create task");
      }
      await fetchBoardTasks(selectedBoardId);
      setIsFormOpen(false);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Failed to create task",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTask = async (formData: TaskFormData) => {
    if (!editingTask?.id) return;
    try {
      setIsSubmitting(true);
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
        const err = await response.json();
        throw new Error(err.error || FAILED_UPDATE_TASK);
      }
      if (selectedBoardId) await fetchBoardTasks(selectedBoardId);
      setIsFormOpen(false);
      setEditingTask(null);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : FAILED_UPDATE_TASK,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      const response = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete task");
      if (selectedBoardId) await fetchBoardTasks(selectedBoardId);
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const handleStatusChange = async (
    id: string,
    status: "TODO" | "IN_PROGRESS" | "DONE",
  ) => {
    const previousTasks = tasks;
    const nextTasks = tasks.map((task) =>
      task.id === id
        ? { ...task, status, updatedAt: new Date().toISOString() }
        : task,
    );
    setTasks(nextTasks);
    updateStats(nextTasks);

    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error(FAILED_UPDATE_TASK);
      if (selectedBoardId)
        fetchBoardTasks(selectedBoardId, { showLoading: false });
    } catch {
      setTasks(previousTasks);
      updateStats(previousTasks);
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Heading as="h1" size="h2">
              Dashboard
            </Heading>
            <Text size="sm" variant="muted" className="mt-1">
              Welcome back! Manage your task boards.
            </Text>
          </div>
        </div>

        {/* Pending Invitations */}
        {invitations.length > 0 && (
          <div className="space-y-2">
            <Heading as="h2" size="h4">
              Pending Invitations
            </Heading>
            {invitations.map((inv) => (
              <InvitationCard
                key={inv.id}
                id={inv.id}
                boardName={inv.boardName}
                inviterEmail={inv.inviterEmail}
                onAccept={(id) => handleRespondInvitation(id, true)}
                onDecline={(id) => handleRespondInvitation(id, false)}
                isLoading={respondingInviteId === inv.id}
              />
            ))}
          </div>
        )}

        {/* Board Selector Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          {boards.map((board) => (
            <button
              key={board.id}
              onClick={() => handleSelectBoard(board.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                board.id === selectedBoardId
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {board.name}
            </button>
          ))}
          <button
            onClick={() => {
              setNewBoardName("");
              setNewBoardError("");
              setIsNewBoardOpen(true);
            }}
            className="flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium border border-dashed border-muted-foreground/40 text-muted-foreground hover:border-muted-foreground hover:text-foreground transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New Board
          </button>
        </div>

        {/* Board Content */}
        {selectedBoard ? (
          <div className="space-y-6">
            {/* Board Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2">
                <Heading as="h2" size="h3">
                  {selectedBoard.name}
                </Heading>
                <button
                  onClick={() => {
                    fetchMembers(selectedBoard.id);
                    setIsSettingsOpen(true);
                  }}
                  className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
                  title="Board settings"
                >
                  <Settings className="w-4 h-4" />
                </button>
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
              <Heading as="h3" size="h4" className="mb-4">
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
        ) : (
          <div className="flex flex-col items-center justify-center min-h-64 gap-4 text-center">
            <Text variant="muted">
              No boards yet. Create your first board to get started.
            </Text>
            <Button
              onClick={() => {
                setNewBoardName("");
                setNewBoardError("");
                setIsNewBoardOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Board
            </Button>
          </div>
        )}
      </div>

      {/* New Board Dialog */}
      <Dialog
        open={isNewBoardOpen}
        onOpenChange={(v) => {
          setIsNewBoardOpen(v);
          if (!v) setNewBoardError("");
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Create New Board</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Input
                placeholder="Board name"
                value={newBoardName}
                onChange={(e) => {
                  setNewBoardName(e.target.value);
                  setNewBoardError("");
                }}
                disabled={isCreatingBoard}
                onKeyDown={(e) => e.key === "Enter" && handleCreateBoard()}
                autoFocus
              />
              {newBoardError && (
                <Text size="sm" className="text-red-600">
                  {newBoardError}
                </Text>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleCreateBoard}
                disabled={isCreatingBoard || !newBoardName.trim()}
              >
                {isCreatingBoard ? "Creating..." : "Create Board"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsNewBoardOpen(false)}
                disabled={isCreatingBoard}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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

      {/* Board Settings Dialog */}
      {selectedBoard && (
        <BoardSettingsDialog
          open={isSettingsOpen}
          onOpenChange={setIsSettingsOpen}
          boardName={selectedBoard.name}
          isOwner={isOwner}
          members={members}
          currentUserId={userId}
          onRename={handleRenameBoard}
          onInvite={handleInvite}
          onRemoveMember={handleRemoveMember}
          onDelete={handleDeleteBoard}
        />
      )}
    </DashboardLayout>
  );
}
