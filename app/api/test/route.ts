import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tasks } from "@/database/schema";

export async function GET() {
  try {
    const result = await db.select().from(tasks);

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/test error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}
