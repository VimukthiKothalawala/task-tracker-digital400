import { NextResponse } from "next/server";
import { updateTask, deleteTask } from "@/lib/actions/tasks";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Clean up optional fields
    const cleanedData = {
      ...body,
      dueDate:
        body.dueDate && typeof body.dueDate === "string" && body.dueDate.trim()
          ? body.dueDate
          : undefined,
      title: body.title ? body.title.trim() : undefined,
      description: body.description ? body.description.trim() : undefined,
    };

    const result = await updateTask(id, cleanedData);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("PATCH /api/tasks/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const result = await deleteTask(id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("DELETE /api/tasks/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 },
    );
  }
}
