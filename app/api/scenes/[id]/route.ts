import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { canModify } from "@/lib/permissions";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.scene.findUnique({ where: { id: Number(id) } });
  if (!existing) return NextResponse.json({ error: "Không tìm thấy cảnh" }, { status: 404 });
  if (!canModify(user, "canh", existing.createdById)) {
    return NextResponse.json({ error: "Không có quyền sửa cảnh này" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const data: Record<string, unknown> = {};
  if (typeof body?.title === "string") data.title = body.title;
  if (typeof body?.space === "string") data.space = body.space;
  if (typeof body?.time === "string") data.time = body.time;
  if (Array.isArray(body?.charactersPresent)) data.charactersPresent = body.charactersPresent;
  if (typeof body?.active === "boolean") data.active = body.active;

  const scene = await prisma.scene.update({ where: { id: Number(id) }, data });
  return NextResponse.json({ scene });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.scene.findUnique({ where: { id: Number(id) } });
  if (!existing) return NextResponse.json({ error: "Không tìm thấy cảnh" }, { status: 404 });
  if (!canModify(user, "canh", existing.createdById)) {
    return NextResponse.json({ error: "Không có quyền xóa cảnh này" }, { status: 403 });
  }

  await prisma.scene.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
