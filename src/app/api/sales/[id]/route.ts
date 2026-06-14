import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/requireRole";

// MANAGER can delete their own sale entries; ADMIN+ can delete any
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { user, error } = await requireRole("MANAGER");
    if (error) return error;

    const isElevated = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

    const existing = await db.saleEntry.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ message: "Sale entry not found" }, { status: 404 });
    }

    // MANAGER can only delete their own entries
    if (!isElevated && existing.userId !== user.id) {
      return NextResponse.json(
        { message: "Forbidden: you can only delete your own sale entries" },
        { status: 403 }
      );
    }

    // Restore the stock when deleting a sale
    await db.$transaction(async (tx) => {
      await tx.saleEntry.delete({ where: { id } });
      await tx.good.update({
        where: { id: existing.goodId },
        data: { currentStock: { increment: existing.quantity } },
      });
    });

    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
