import { NextResponse } from "next/server";
import { getBoardTasks, createBoardTask } from "@/lib/actions/tasks";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const result = await getBoardTasks(id);

    if (!result.success) {
      const status = result.error === "Unauthorized" ? 401 : 500;
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json(result.data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, priority, status, dueDate } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const result = await createBoardTask(
      id,
      title.trim(),
      description?.trim() || "",
      priority || "MEDIUM",
      status || "TODO",
      dueDate && typeof dueDate === "string" && dueDate.trim()
        ? dueDate
        : undefined,
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 },
    );
  }
}
