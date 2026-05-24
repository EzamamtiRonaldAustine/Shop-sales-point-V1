// This API route handles user registration. It validates the incoming data, checks for existing users, hashes the password, and creates a new user in the database. It also returns appropriate responses based on the outcome of the registration process.
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { registerSchema } from "@/lib/validations";
import bcrypt from "bcryptjs";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, name, password } = registerSchema.parse(body);

    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { user: null, message: "User with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await db.user.create({
      data: {
        email,
        name,
        passwordHash: hashedPassword,
      },
    });

    return NextResponse.json(
      { user: { id: newUser.id, email: newUser.email, name: newUser.name }, message: "User created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: "Invalid registration data", errors: error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { message: "User with this email already exists" },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { message: "Something went wrong!" },
      { status: 500 }
    );
  }
}
