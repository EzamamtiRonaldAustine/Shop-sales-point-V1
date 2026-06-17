import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";

/**
 * POST /api/auth/change-password
 * 
 * Secure endpoint to handle the one-time default password reset.
 * This route requires the user to be fully authenticated, meaning only the 
 * logged-in user can change their own password via this flow.
 */
export async function POST(req: Request) {
  try {
    // 1. Verify the user is authenticated via NextAuth
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { password } = body;

    // 2. Validate the new password
    if (!password || password.length < 6) {
      return NextResponse.json({ message: "Password must be at least 6 characters" }, { status: 400 });
    }

    // 3. Hash the new password securely using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Update the user's record in the database.
    // Importantly, we toggle `requiresPasswordChange` back to false so the user
    // regains full access to the dashboard.
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
