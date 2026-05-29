import { NextResponse } from "next/server";
import { getBoards, createBoard } from "@/lib/actions/boards";

export async function GET() {
  try {
    const result = await getBoards();
    if (!result.success) {
      const status = result.error === "Unauthorized" ? 401 : 500;
      return NextResponse.json({ error: result.error }, { status });
    }
    return NextResponse.json(result.data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch boards" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Board name is required" },
        { status: 400 },
      );
    }

    const result = await createBoard(
      name.trim(),
      description?.trim() || undefined,
    );
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create board" },
      { status: 500 },
    );
  }
}
