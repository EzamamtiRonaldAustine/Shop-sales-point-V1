import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/requireRole";
import { z } from "zod";

const patchSchema = z.object({
  role: z.enum(["SUPER_ADMIN", "ADMIN", "MANAGER", "STAFF"]).optional(),
  name: z.string().min(2).optional(),
});

// PATCH /api/admin/users/[id] — update role or name (SUPER_ADMIN only)
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { user: actor, error } = await requireRole("SUPER_ADMIN");
    if (error) return error;

    // Prevent SUPER_ADMIN from demoting themselves
    if (id === actor.id) {
      return NextResponse.json(
        { message: "You cannot change your own role" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const data = patchSchema.parse(body);

    const updated = await db.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ message: "Invalid data" }, { status: 400 });
  }
}

// DELETE /api/admin/users/[id] — soft-delete user (SUPER_ADMIN only)
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { user: actor, error } = await requireRole("SUPER_ADMIN");
    if (error) return error;

    if (id === actor.id) {
      return NextResponse.json(
        { message: "You cannot delete your own account" },
        { status: 400 }
      );
    }

    const updated = await db.user.update({
      where: { id },
      data: { deletedAt: new Date() },
      select: { id: true, deletedAt: true },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
