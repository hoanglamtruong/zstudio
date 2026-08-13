import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission, SHOT_CONTENT_TYPE_TO_MODULE } from "@/lib/permissions";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.shotContent.findUnique({ where: { id: Number(id) } });
  if (!existing) return NextResponse.json({ error: "Không tìm thấy nội dung" }, { status: 404 });

  const mod = SHOT_CONTENT_TYPE_TO_MODULE[existing.type];
  if (!hasPermission(user, mod)) {
    return NextResponse.json({ error: `Không có quyền '${mod}'` }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const data: Record<string, unknown> = {};
  if (typeof body?.character === "string") data.character = body.character;
  if (typeof body?.text === "string") data.text = body.text;

  const content = await prisma.shotContent.update({ where: { id: Number(id) }, data });
  return NextResponse.json({ content });
}
