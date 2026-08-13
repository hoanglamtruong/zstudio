import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const VALID_TARGETS = ["CHARACTER", "TAP", "SCENE", "SHOT"];

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const targetType = searchParams.get("targetType") ?? "";
  const targetId = Number(searchParams.get("targetId"));
  if (!VALID_TARGETS.includes(targetType) || !targetId) {
    return NextResponse.json({ error: "targetType/targetId không hợp lệ" }, { status: 400 });
  }

  const comments = await prisma.comment.findMany({
    where: { targetType: targetType as never, targetId },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ comments });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const targetType = String(body?.targetType ?? "");
  const targetId = Number(body?.targetId);
  const text = String(body?.text ?? "").trim();
  if (!VALID_TARGETS.includes(targetType) || !targetId || !text) {
    return NextResponse.json({ error: "Thiếu targetType/targetId/text" }, { status: 400 });
  }

  const comment = await prisma.comment.create({
    data: {
      targetType: targetType as never,
      targetId,
      author: user.name,
      text,
    },
  });
  return NextResponse.json({ comment }, { status: 201 });
}
