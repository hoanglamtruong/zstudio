import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  if (!hasPermission(user, "shot")) {
    return NextResponse.json({ error: "Không có quyền 'shot'" }, { status: 403 });
  }
  const body = await req.json().catch(() => null);
  const shotId = Number(body?.shotId);
  const imageUrl = String(body?.imageUrl ?? "").trim();
  if (!shotId || !imageUrl) return NextResponse.json({ error: "Thiếu shotId/imageUrl" }, { status: 400 });

  const count = await prisma.frame.count({ where: { shotId } });
  const frame = await prisma.frame.create({
    data: { shotId, imageUrl, order: count + 1 },
  });
  return NextResponse.json({ frame }, { status: 201 });
}
