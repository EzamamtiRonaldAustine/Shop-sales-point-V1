import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";

/**
 * POST /api/auth/change-password
 *
 * Handles two distinct flows:
 *
 * 1. **Forced reset** (first-login): Body contains only `{ password }`.
 *    Used by the ChangePasswordPopup when `requiresPasswordChange` is true.
 *    No current-password verification is required because the account was
 *    provisioned by an admin and the user has not yet set their own password.
 *
 * 2. **Voluntary change** (Profile page): Body contains `{ currentPassword, password }`.
 *    The current password is verified against the stored hash before updating.
 *    This prevents silent credential changes if a session is briefly compromised.
 *
 * Both flows require a valid authenticated session.
 */
export async function POST(req: Request) {
  try {
    // 1. Verify the user is authenticated via NextAuth
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { currentPassword, password } = body;

    // 2. Validate the new password length
    if (!password || password.length < 6) {
      return NextResponse.json(
        { message: "New password must be at least 6 characters." },
        { status: 400 }
      );
    }

    // 3. Fetch the user from the database to verify the current password
    const dbUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { passwordHash: true, requiresPasswordChange: true },
    });

    if (!dbUser) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    // 4. If this is a voluntary change (not a forced first-login reset),
    //    verify the current password before allowing the update.
    if (!dbUser.requiresPasswordChange) {
      if (!currentPassword) {
        return NextResponse.json(
          { message: "Current password is required." },
          { status: 400 }
        );
      }

      if (!dbUser.passwordHash) {
        return NextResponse.json(
          { message: "No password set for this account." },
          { status: 400 }
        );
      }

      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        dbUser.passwordHash
      );

      if (!isCurrentPasswordValid) {
        return NextResponse.json(
          { message: "Current password is incorrect." },
          { status: 400 }
        );
      }

      // Prevent setting the same password as the current one
      const isSamePassword = await bcrypt.compare(password, dbUser.passwordHash);
      if (isSamePassword) {
        return NextResponse.json(
          { message: "New password must be different from your current password." },
          { status: 400 }
        );
      }
    }

    // 5. Hash the new password securely using bcrypt (cost factor 10)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6. Update the user record. Also toggle `requiresPasswordChange` to false
    //    so the forced-reset overlay is dismissed if this was a forced flow.
    await db.user.update({
      where: { id: session.user.id },
      data: {
        passwordHash: hashedPassword,
        requiresPasswordChange: false,
      },
    });

    return NextResponse.json(
      { message: "Password updated successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Password change error:", error);
    return NextResponse.json({ message: "Something went wrong." }, { status: 500 });
  }
}
