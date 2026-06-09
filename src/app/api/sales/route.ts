import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { saleSchema } from "@/lib/validations";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const sales = await db.saleEntry.findMany({
      where: { userId: session.user.id },
      include: { good: true },
      orderBy: { saleDate: "desc" },
    });

    return NextResponse.json(sales);
  } catch (error) {
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await req.json();
    const validatedData = saleSchema.parse(body);

    const good = await db.good.findUnique({
      where: { id: validatedData.goodId }
    });

    if (!good) {
       return NextResponse.json({ message: "Good not found" }, { status: 404 });
    }

    // Auto-calculate revenue if it wasn't provided (for rapid entry)
    const totalRevenue = body.totalRevenue ? Number(body.totalRevenue) : Number(good.sellingPrice) * validatedData.quantity;

    // Use transaction to create sale and deduct stock
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

      const updatedGood = await tx.good.update({
        where: { id: validatedData.goodId },
        data: {
          currentStock: {
            decrement: validatedData.quantity,
          },
        },
      });

      return { newSale, updatedGood };
    });

    return NextResponse.json(result.newSale, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Invalid request data" }, { status: 400 });
  }
}
