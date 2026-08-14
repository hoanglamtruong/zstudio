import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

async function assertNotLastLeader(targetId: number) {
  const target = await prisma.user.findUnique({ where: { id: targetId } });
  if (!target) return null;
  if (target.isLeader) {
    const otherActiveLeaders = await prisma.user.count({
      where: { isLeader: true, active: true, id: { not: targetId } },
    });
    if (otherActiveLeaders === 0) {
      return "Không thể xóa/ẩn leader duy nhất còn lại";
    }
  }
  return null;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const currentUser = await getCurrentUser();
  if (!currentUser?.isLeader) {
    return NextResponse.json({ error: "Chỉ leader mới sửa user được" }, { status: 403 });
  }
  const { id } = await params;
  const userId = Number(id);
  const body = await req.json().catch(() => null);

  const data: { name?: string; active?: boolean } = {};
  if (typeof body?.name === "string" && body.name.trim()) data.name = body.name.trim();
  if (typeof body?.active === "boolean") data.active = body.active;

  if (data.active === false) {
    const blockReason = await assertNotLastLeader(userId);
    if (blockReason) return NextResponse.json({ error: blockReason }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: { id: true, username: true, name: true, isLeader: true, permissions: true, active: true, createdAt: true },
  });
  return NextResponse.json({ user });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const currentUser = await getCurrentUser();
  if (!currentUser?.isLeader) {
    return NextResponse.json({ error: "Chỉ leader mới xóa user được" }, { status: 403 });
  }
  const { id } = await params;
  const userId = Number(id);

  const blockReason = await assertNotLastLeader(userId);
  if (blockReason) return NextResponse.json({ error: blockReason }, { status: 400 });

  await prisma.user.delete({ where: { id: userId } });
  return NextResponse.json({ ok: true });
}
