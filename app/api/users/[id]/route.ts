import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isManager } from "@/lib/permissions";
import { Role } from "@/lib/types";

const ROLES: Role[] = ["MANAGER", "ADMIN", "STAFF"];

// Chặn thao tác khiến hệ thống mất Manager cuối cùng: xóa/ẩn/hạ role một
// Manager khi không còn Manager nào khác đang hoạt động.
async function assertNotLastManager(targetId: number, becomingNonManager: boolean) {
  const target = await prisma.user.findUnique({ where: { id: targetId } });
  if (!target) return null;
  if (target.role === "MANAGER" && becomingNonManager) {
    const otherActiveManagers = await prisma.user.count({
      where: { role: "MANAGER", active: true, id: { not: targetId } },
    });
    if (otherActiveManagers === 0) {
      return "Không thể xóa/ẩn/hạ quyền Manager duy nhất còn lại";
    }
  }
  return null;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const currentUser = await getCurrentUser();
  if (!isManager(currentUser)) {
    return NextResponse.json({ error: "Chỉ Manager mới sửa user được" }, { status: 403 });
  }
  const { id } = await params;
  const userId = Number(id);
  const body = await req.json().catch(() => null);

  const data: { name?: string; active?: boolean; approved?: boolean; role?: Role } = {};
  if (typeof body?.name === "string" && body.name.trim()) data.name = body.name.trim();
  if (typeof body?.active === "boolean") data.active = body.active;
  if (typeof body?.approved === "boolean") data.approved = body.approved;
  if (ROLES.includes(body?.role)) data.role = body.role;

  const becomingNonManager = data.active === false || (data.role !== undefined && data.role !== "MANAGER");
  if (becomingNonManager) {
    const blockReason = await assertNotLastManager(userId, true);
    if (blockReason) return NextResponse.json({ error: blockReason }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      username: true,
      name: true,
      role: true,
      permissions: true,
      active: true,
      approved: true,
      createdAt: true,
    },
  });
  return NextResponse.json({ user });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const currentUser = await getCurrentUser();
  if (!isManager(currentUser)) {
    return NextResponse.json({ error: "Chỉ Manager mới xóa user được" }, { status: 403 });
  }
  const { id } = await params;
  const userId = Number(id);

  const blockReason = await assertNotLastManager(userId, true);
  if (blockReason) return NextResponse.json({ error: blockReason }, { status: 400 });

  await prisma.user.delete({ where: { id: userId } });
  return NextResponse.json({ ok: true });
}
