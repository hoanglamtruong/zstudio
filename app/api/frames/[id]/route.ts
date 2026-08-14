import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { canModify } from "@/lib/permissions";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.frame.findUnique({ where: { id: Number(id) } });
  if (!existing) return NextResponse.json({ error: "Không tìm thấy frame" }, { status: 404 });
  if (!canModify(user, "shot", existing.createdById)) {
    return NextResponse.json({ error: "Không có quyền sửa frame này" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const data: Record<string, unknown> = {};
  if (typeof body?.imageUrl === "string" && body.imageUrl.trim()) data.imageUrl = body.imageUrl.trim();
  if (typeof body?.active === "boolean") data.active = body.active;

  const frame = await prisma.frame.update({ where: { id: Number(id) }, data });
  return NextResponse.json({ frame });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.frame.findUnique({ where: { id: Number(id) } });
  if (!existing) return NextResponse.json({ error: "Không tìm thấy frame" }, { status: 404 });
  if (!canModify(user, "shot", existing.createdById)) {
    return NextResponse.json({ error: "Không có quyền xóa frame này" }, { status: 403 });
  }

  await prisma.frame.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
