import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/requireRole";
import { goodSchema } from "@/lib/validations";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { user, error } = await requireRole("STAFF");
    if (error) return error;

    const isElevated = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
    const good = await db.good.findUnique({
      where: isElevated ? { id } : { id, userId: user.id },
    });

    if (!good) {
      return NextResponse.json({ message: "Good not found" }, { status: 404 });
    }

    return NextResponse.json(good);
  } catch {
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { user, error } = await requireRole("MANAGER");
    if (error) return error;

    const body = await req.json();
    const validatedData = goodSchema.parse(body);

    const isElevated = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
    const updatedGood = await db.good.update({
      where: isElevated ? { id } : { id, userId: user.id },
      data: validatedData,
    });

    return NextResponse.json(updatedGood);
  } catch {
    return NextResponse.json({ message: "Invalid request data" }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { user, error } = await requireRole("MANAGER");
    if (error) return error;

    const isElevated = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
    await db.good.delete({
      where: isElevated ? { id } : { id, userId: user.id },
    });

    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
