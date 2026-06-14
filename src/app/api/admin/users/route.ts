import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/requireRole";
import bcrypt from "bcryptjs";
import { z } from "zod";

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "MANAGER", "STAFF"]).default("STAFF"),
});

// GET /api/admin/users — list all users (SUPER_ADMIN only)
export async function GET() {
  try {
    const { error } = await requireRole("SUPER_ADMIN");
    if (error) return error;

    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        deletedAt: true,
        createdAt: true,
        loginSessions: {
          orderBy: { loginAt: "desc" },
          take: 1,
          select: { loginAt: true, ipAddress: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(users);
  } catch {
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}

// POST /api/admin/users — create user directly (SUPER_ADMIN only)
export async function POST(req: Request) {
  try {
    const { error } = await requireRole("SUPER_ADMIN");
    if (error) return error;

    const body = await req.json();
    const { name, email, password, role } = createUserSchema.parse(body);

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ message: "Email already in use" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await db.user.create({
      data: { name, email, passwordHash, role },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    return NextResponse.json(user, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Invalid data" }, { status: 400 });
  }
}
