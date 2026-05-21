import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { goodSchema } from "@/lib/validations";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const good = await db.good.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!good) {
      return NextResponse.json({ message: "Good not found" }, { status: 404 });
    }

    return NextResponse.json(good);
  } catch (error) {
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = goodSchema.parse(body);

    const updatedGood = await db.good.update({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      data: validatedData,
    });

    return NextResponse.json(updatedGood);
  } catch (error) {
    return NextResponse.json({ message: "Invalid request data" }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await db.good.delete({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
