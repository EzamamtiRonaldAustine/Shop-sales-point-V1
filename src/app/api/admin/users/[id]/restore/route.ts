import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/requireRole";

// POST /api/admin/users/[id]/restore — restore soft-deleted user (SUPER_ADMIN only)
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { error } = await requireRole("SUPER_ADMIN");
    if (error) return error;

    const user = await db.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (!user.deletedAt) {
      return NextResponse.json({ message: "User is not deleted" }, { status: 400 });
    }

    // Check 30-day restoration window
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    if (user.deletedAt < thirtyDaysAgo) {
      return NextResponse.json(
        { message: "Restoration period (30 days) has expired" },
        { status: 410 }
      );
    }

    const restored = await db.user.update({
      where: { id },
      data: { deletedAt: null },
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json(restored);
  } catch {
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
