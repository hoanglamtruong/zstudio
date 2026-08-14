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
  const sceneId = Number(body?.sceneId);
  const title = String(body?.title ?? "").trim();
  if (!sceneId || !title) return NextResponse.json({ error: "Thiếu sceneId/title" }, { status: 400 });

  const count = await prisma.shot.count({ where: { sceneId } });
  const shot = await prisma.shot.create({
    data: {
      sceneId,
      title,
      angle: String(body?.angle ?? ""),
      movement: String(body?.movement ?? ""),
      order: count + 1,
      createdById: user.id,
      createdByName: user.name,
    },
  });
  return NextResponse.json({ shot }, { status: 201 });
}
