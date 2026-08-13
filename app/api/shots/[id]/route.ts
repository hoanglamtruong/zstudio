import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  if (!hasPermission(user, "shot")) {
    return NextResponse.json({ error: "Không có quyền 'shot'" }, { status: 403 });
  }
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const data: Record<string, unknown> = {};
  if (typeof body?.title === "string") data.title = body.title;
  if (typeof body?.angle === "string") data.angle = body.angle;
  if (typeof body?.movement === "string") data.movement = body.movement;

  const shot = await prisma.shot.update({ where: { id: Number(id) }, data });
  return NextResponse.json({ shot });
}
