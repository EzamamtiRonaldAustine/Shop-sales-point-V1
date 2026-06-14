import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { type Role } from "@prisma/client";

// Hierarchy order — higher index = more privileged
const ROLE_ORDER: Role[] = ["STAFF", "MANAGER", "ADMIN", "SUPER_ADMIN"];

/**
 * Returns the session user if their role meets the required minimum,
 * otherwise returns a 401/403 NextResponse.
 *
 * Usage in a route handler:
 *   const { user, error } = await requireRole("MANAGER");
 *   if (error) return error;
 */
export async function requireRole(minimum: Role): Promise<
  | { user: { id: string; role: Role }; error: null }
  | { user: null; error: NextResponse }
> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      user: null,
      error: NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
    };
  }

  const userRole = (session.user as { role?: Role }).role ?? "STAFF";
  const userLevel = ROLE_ORDER.indexOf(userRole);
  const requiredLevel = ROLE_ORDER.indexOf(minimum);

  if (userLevel < requiredLevel) {
    return {
      user: null,
      error: NextResponse.json(
        { message: "Forbidden: insufficient permissions" },
        { status: 403 }
      ),
    };
  }

  return {
    user: { id: session.user.id, role: userRole },
    error: null,
  };
}

/**
 * Returns true if roleA is at least as privileged as roleB.
 */
export function hasMinRole(userRole: Role, minimum: Role): boolean {
  return ROLE_ORDER.indexOf(userRole) >= ROLE_ORDER.indexOf(minimum);
}
