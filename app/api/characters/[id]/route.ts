import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { canModify } from "@/lib/permissions";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.character.findUnique({ where: { id: Number(id) } });
  if (!existing) return NextResponse.json({ error: "Không tìm thấy nhân vật" }, { status: 404 });
  if (!canModify(user, "nhanvat", existing.createdById)) {
    return NextResponse.json({ error: "Không có quyền sửa nhân vật này" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const data: { name?: string; desc?: string; active?: boolean } = {};
  if (typeof body?.name === "string") data.name = body.name;
  if (typeof body?.desc === "string") data.desc = body.desc;
  if (typeof body?.active === "boolean") data.active = body.active;

  const character = await prisma.character.update({ where: { id: Number(id) }, data });
  return NextResponse.json({ character });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.character.findUnique({ where: { id: Number(id) } });
  if (!existing) return NextResponse.json({ error: "Không tìm thấy nhân vật" }, { status: 404 });
  if (!canModify(user, "nhanvat", existing.createdById)) {
    return NextResponse.json({ error: "Không có quyền xóa nhân vật này" }, { status: 403 });
  }

  await prisma.character.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
