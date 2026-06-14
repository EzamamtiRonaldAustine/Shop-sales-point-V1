import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/requireRole";

// GET /api/admin/sessions — list all login sessions (SUPER_ADMIN only)
export async function GET() {
  try {
    const { error } = await requireRole("SUPER_ADMIN");
    if (error) return error;

    const sessions = await db.loginSession.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { loginAt: "desc" },
      take: 200,
    });

    return NextResponse.json(sessions);
  } catch {
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
