import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db";
import { UserSettingsModel } from "@/models/UserSettings";

const putSchema = z.object({
  visibleColumns: z.array(z.string()).default([]),
});

export async function GET(
  _req: Request,
  context: { params: Promise<{ userId: string }> }
) {
  const { userId } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.id !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectToDatabase();
  const doc = await UserSettingsModel.findOne({
    userId,
  }).lean();
  return NextResponse.json({
    settings: {
      visibleColumns: doc?.visibleColumns ?? [],
    },
  });
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ userId: string }> }
) {
  const { userId } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.id !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const parsed = putSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  await connectToDatabase();
  const { visibleColumns } = parsed.data;
  await UserSettingsModel.findOneAndUpdate(
    { userId },
    { $set: { visibleColumns } },
    { upsert: true }
  );
  return NextResponse.json({ ok: true });
}
