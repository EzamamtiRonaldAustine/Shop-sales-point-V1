import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/requireRole";
import { goodSchema } from "@/lib/validations";

export async function GET() {
  try {
    const { user, error } = await requireRole("STAFF");
    if (error) return error;

    // ADMIN and SUPER_ADMIN see all goods; MANAGER and STAFF see their own
    const isElevated = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
    const goods = await db.good.findMany({
      where: isElevated ? {} : { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(goods);
  } catch {
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { user, error } = await requireRole("MANAGER");
    if (error) return error;

    const body = await req.json();
    const validatedData = goodSchema.parse(body);

    const newGood = await db.good.create({
      data: {
        ...validatedData,
        userId: user.id,
      },
    });

    return NextResponse.json(newGood, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Invalid request data" }, { status: 400 });
  }
}
