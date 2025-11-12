import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import { UserModel } from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const name = String(body?.name ?? "").trim();
    const email = String(body?.email ?? "")
      .toLowerCase()
      .trim();
    const password = String(body?.password ?? "");

    console.log("[Signup] Attempting signup for:", email);

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    console.log("[Signup] Connecting to database...");
    await connectToDatabase();
    console.log("[Signup] Database connected");

    const existing = await UserModel.findOne({ email }).lean();
    if (existing) {
      console.log("[Signup] Email already exists:", email);
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    console.log("[Signup] Creating new user...");
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await UserModel.create({ name, email, passwordHash });
    console.log("[Signup] User created successfully:", newUser._id);

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("[Signup] Error:", error);
    return NextResponse.json(
      { error: "Server error", message: (error as Error).message },
      { status: 500 }
    );
  }
}
