import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { canManageUsers } from "@/lib/permissions";
import { Role } from "@/lib/types";

// Manager không thể gán qua ứng dụng — chỉ có đúng 1 Manager trong hệ thống.
const ASSIGNABLE_ROLES: Role[] = ["ASSISTANT", "ADMIN", "STAFF"];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const currentUser = await getCurrentUser();
  if (!canManageUsers(currentUser)) {
    return NextResponse.json({ error: "Chỉ Manager/Assistant mới sửa user được" }, { status: 403 });
  }
  const { id } = await params;
  const userId = Number(id);

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) return NextResponse.json({ error: "Không tìm thấy user" }, { status: 404 });
  if (target.role === "MANAGER") {
    return NextResponse.json({ error: "Không thể chỉnh sửa tài khoản Manager" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const data: { name?: string; active?: boolean; approved?: boolean; role?: Role } = {};
  if (typeof body?.name === "string" && body.name.trim()) data.name = body.name.trim();
  if (typeof body?.active === "boolean") data.active = body.active;
  if (typeof body?.approved === "boolean") data.approved = body.approved;
  if (body?.role !== undefined) {
    if (!ASSIGNABLE_ROLES.includes(body.role)) {
      return NextResponse.json({ error: "Vai trò không hợp lệ (không thể gán Manager)" }, { status: 400 });
    }
    data.role = body.role;
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
  if (!canManageUsers(currentUser)) {
    return NextResponse.json({ error: "Chỉ Manager/Assistant mới xóa user được" }, { status: 403 });
  }
  const { id } = await params;
  const userId = Number(id);

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) return NextResponse.json({ error: "Không tìm thấy user" }, { status: 404 });
  if (target.role === "MANAGER") {
    return NextResponse.json({ error: "Không thể xóa tài khoản Manager" }, { status: 403 });
  }

  await prisma.user.delete({ where: { id: userId } });
  return NextResponse.json({ ok: true });
}
