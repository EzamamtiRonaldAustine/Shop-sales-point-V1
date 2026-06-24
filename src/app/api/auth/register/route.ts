// Registration API: assigns STAFF role by default.
// The very first user on the system gets SUPER_ADMIN automatically.
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { registerSchema } from "@/lib/validations";
import bcrypt from "bcryptjs";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

// function to handle POST requests for user registration
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, name, password } = registerSchema.parse(body);

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { user: null, message: "User with this email already exists" },
        { status: 409 }
      );
    }
    
    // hash the password before storing it in the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // First ever user becomes SUPER_ADMIN — everyone else gets STAFF
    const userCount = await db.user.count();
    const role = userCount === 0 ? "SUPER_ADMIN" : "STAFF";
    
    //new user creation in the database
    const newUser = await db.user.create({
      data: { email, name, passwordHash: hashedPassword, role },
    });

    return NextResponse.json(
      {
        user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role },
        message: "User created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);

    // Handle validation errors from Zod and unique constraint errors from Prisma
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: "Invalid registration data", errors: error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Handle unique constraint violation for email (Prisma error code P2002)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json({ message: "Something went wrong!" }, { status: 500 });
  }
}
