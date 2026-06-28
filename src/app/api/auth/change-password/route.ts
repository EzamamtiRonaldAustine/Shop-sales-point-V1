import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { changePasswordSchema } from "@/lib/validations";
import { ZodError } from "zod";

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
      return NextResponse.json({ message: "Unauthorized access. Please log in." }, { status: 401 });
    }

    const body = await req.json();
    
    // 2. Validate using Zod schema
    const { currentPassword, password } = changePasswordSchema.parse(body);

    // 3. Fetch the user from the database to verify the current password
    const dbUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { passwordHash: true, requiresPasswordChange: true },
    });

    if (!dbUser) {
      return NextResponse.json({ message: "User account not found." }, { status: 404 });
    }

    // 4. If this is a voluntary change (not a forced first-login reset),
    //    verify the current password before allowing the update.
    if (!dbUser.requiresPasswordChange) {
      if (!currentPassword) {
        return NextResponse.json(
          { message: "Current password is required to change your password." },
          { status: 400 }
        );
      }

      if (!dbUser.passwordHash) {
        return NextResponse.json(
          { message: "No password is set for this account." },
          { status: 400 }
        );
      }

      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        dbUser.passwordHash
      );

      if (!isCurrentPasswordValid) {
        return NextResponse.json(
          { message: "The current password provided is incorrect." },
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
    
    // Handle validation errors from Zod
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: "Invalid password data provided.", errors: error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ message: "An unexpected error occurred while updating the password." }, { status: 500 });
  }
}

