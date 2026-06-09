import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { investmentSchema } from "@/lib/validations";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const logs = await db.investmentLog.findMany({
      where: { userId: session.user.id },
      include: { good: true },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(logs);
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
    const validatedData = investmentSchema.parse(body);

    // Use a transaction if this investment adds stock
    if (validatedData.goodId && validatedData.quantityAdded) {
      const result = await db.$transaction(async (tx) => {
        const newInvestment = await tx.investmentLog.create({
          data: {
            ...validatedData,
            date: new Date(validatedData.date),
            userId,
          },
        });

        const updatedGood = await tx.good.update({
          where: { id: validatedData.goodId },
          data: {
            currentStock: {
              increment: validatedData.quantityAdded,
            },
          },
        });

        return { newInvestment, updatedGood };
      });
      return NextResponse.json(result.newInvestment, { status: 201 });
    } else {
      const newInvestment = await db.investmentLog.create({
        data: {
          ...validatedData,
          date: new Date(validatedData.date),
          userId,
        },
      });
      return NextResponse.json(newInvestment, { status: 201 });
    }
  } catch (error) {
    return NextResponse.json({ message: "Invalid request data" }, { status: 400 });
  }
}
