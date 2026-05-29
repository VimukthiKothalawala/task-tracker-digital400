import { NextResponse } from "next/server";
import { respondToInvitation } from "@/lib/actions/invitations";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { accept } = body;

    if (typeof accept !== "boolean") {
      return NextResponse.json(
        { error: "accept (boolean) is required" },
        { status: 400 },
      );
    }

    const result = await respondToInvitation(id, accept);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to respond to invitation" },
      { status: 500 },
    );
  }
}
