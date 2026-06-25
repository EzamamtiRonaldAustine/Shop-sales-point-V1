import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { image } = await req.json();

    if (!image || typeof image !== "string") {
      return NextResponse.json({ message: "Invalid image data" }, { status: 400 });
    }

    // Basic validation to ensure it's a data URL
    if (!image.startsWith("data:image/")) {
      return NextResponse.json({ message: "Invalid image format" }, { status: 400 });
    }

    // Update the user's profile image in the database
    await db.user.update({
      where: { id: session.user.id },
      data: { profileImage: image },
    });

    return NextResponse.json({ message: "Profile picture updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Profile Image Upload Error:", error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
