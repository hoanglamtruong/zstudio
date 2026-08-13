import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  if (!hasPermission(user, "canh")) {
    return NextResponse.json({ error: "Không có quyền 'canh'" }, { status: 403 });
  }
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const data: Record<string, unknown> = {};
  if (typeof body?.title === "string") data.title = body.title;
  if (typeof body?.space === "string") data.space = body.space;
  if (typeof body?.time === "string") data.time = body.time;
  if (Array.isArray(body?.charactersPresent)) data.charactersPresent = body.charactersPresent;

  const scene = await prisma.scene.update({ where: { id: Number(id) }, data });
  return NextResponse.json({ scene });
}
