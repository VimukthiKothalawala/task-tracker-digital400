import { NextResponse } from "next/server";
import { getTasks, createTask } from "@/lib/actions/tasks";

export async function GET() {
  const result = await getTasks();
  
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(result.data);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, priority, status, dueDate } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const result = await createTask(
      title,
      description || "",
      priority || "MEDIUM",
      status || "TODO",
      dueDate
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
