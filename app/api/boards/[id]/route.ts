import { NextResponse } from "next/server";
import { updateBoard, deleteBoard } from "@/lib/actions/boards";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description } = body;

    const result = await updateBoard(id, {
      name: name?.trim() || undefined,
      description: description?.trim() ?? undefined,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data);
  } catch {
    return NextResponse.json(
      { error: "Failed to update board" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const result = await deleteBoard(id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data);
  } catch {
    return NextResponse.json(
      { error: "Failed to delete board" },
      { status: 500 },
    );
  }
}
