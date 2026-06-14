import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/requireRole";
import { saleSchema } from "@/lib/validations";

export async function GET() {
  try {
    const { user, error } = await requireRole("MANAGER");
    if (error) return error;

    const isElevated = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

    const sales = await db.saleEntry.findMany({
      where: isElevated ? {} : { userId: user.id },
      include: { good: true },
      orderBy: { saleDate: "desc" },
    });

    return NextResponse.json(sales);
  } catch {
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { user, error } = await requireRole("STAFF");
    if (error) return error;

    const userId = user.id;

    const body = await req.json();
    const validatedData = saleSchema.parse(body);

    const good = await db.good.findUnique({
      where: { id: validatedData.goodId },
    });

    if (!good) {
      return NextResponse.json({ message: "Good not found" }, { status: 404 });
    }

    const totalRevenue = body.totalRevenue
      ? Number(body.totalRevenue)
      : Number(good.sellingPrice) * validatedData.quantity;

    const result = await db.$transaction(async (tx) => {
      const newSale = await tx.saleEntry.create({
        data: {
          goodId: validatedData.goodId,
          quantity: validatedData.quantity,
          saleDate: new Date(validatedData.saleDate),
          note: validatedData.note,
          totalRevenue: totalRevenue,
          userId,
        },
      });

      await tx.good.update({
        where: { id: validatedData.goodId },
        data: { currentStock: { decrement: validatedData.quantity } },
      });

      return newSale;
    });

    return NextResponse.json(result, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Invalid request data" }, { status: 400 });
  }
}
