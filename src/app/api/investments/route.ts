import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/requireRole";
import { investmentSchema } from "@/lib/validations";

export async function GET() {
  try {
    const { user, error } = await requireRole("MANAGER");
    if (error) return error;

    const isElevated = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

    const logs = await db.investmentLog.findMany({
      where: isElevated ? {} : { userId: user.id },
      include: { good: true },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(logs);
  } catch {
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { user, error } = await requireRole("MANAGER");
    if (error) return error;

    const userId = user.id;
    const body = await req.json();
    const validatedData = investmentSchema.parse(body);

    if (validatedData.goodId && validatedData.quantityAdded) {
      const result = await db.$transaction(async (tx) => {
        const newInvestment = await tx.investmentLog.create({
          data: { ...validatedData, date: new Date(validatedData.date), userId },
        });

        await tx.good.update({
          where: { id: validatedData.goodId },
          data: { currentStock: { increment: validatedData.quantityAdded } },
        });

        return newInvestment;
      });
      return NextResponse.json(result, { status: 201 });
    } else {
      const newInvestment = await db.investmentLog.create({
        data: { ...validatedData, date: new Date(validatedData.date), userId },
      });
      return NextResponse.json(newInvestment, { status: 201 });
    }
  } catch {
    return NextResponse.json({ message: "Invalid request data" }, { status: 400 });
  }
}
