import { NextResponse } from "next/server";
import { getMyInvitations } from "@/lib/actions/invitations";

export async function GET() {
  try {
    const result = await getMyInvitations();

    if (!result.success) {
      const status = result.error === "Unauthorized" ? 401 : 500;
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json(result.data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch invitations" },
      { status: 500 },
    );
  }
}
