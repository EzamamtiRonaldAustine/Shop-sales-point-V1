import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { password } = body;

    if (!password || password.length < 6) {
      return NextResponse.json({ message: "Password must be at least 6 characters" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.user.update({
      where: { id: session.user.id },
      data: {
        passwordHash: hashedPassword,
        requiresPasswordChange: false,
      },
    });

    return NextResponse.json({ message: "Password updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Password change error:", error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
