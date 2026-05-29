import { NextResponse } from "next/server";
import { ensureDefaultBoard } from "@/lib/actions/boards";

export async function POST() {
  try {
    const result = await ensureDefaultBoard();
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ created: result.created });
  } catch {
    return NextResponse.json(
      { error: "Failed to initialize default board" },
      { status: 500 },
    );
  }
}
