import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { canAssignStaffPermissions, canManageUsers } from "@/lib/permissions";
import { Role } from "@/lib/types";

// Manager không thể gán qua ứng dụng — chỉ có đúng 1 Manager trong hệ thống.
const ASSIGNABLE_ROLES: Role[] = ["ASSISTANT", "ADMIN", "STAFF"];

const USER_SELECT = {
  id: true,
  username: true,
  name: true,
  role: true,
  permissions: true,
  active: true,
  approved: true,
  createdAt: true,
};

export async function GET() {
  const user = await getCurrentUser();
  if (!canManageUsers(user) && !canAssignStaffPermissions(user)) {
    return NextResponse.json({ error: "Không có quyền xem danh sách user" }, { status: 403 });
  }
  const users = await prisma.user.findMany({ select: USER_SELECT, orderBy: { id: "asc" } });
  return NextResponse.json({ users });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!canManageUsers(user)) {
    return NextResponse.json({ error: "Chỉ Manager/Assistant mới tạo được user" }, { status: 403 });
  }
  const body = await req.json().catch(() => null);
  const name = String(body?.name ?? "").trim();
  const username = String(body?.username ?? "").trim();
  const password = String(body?.password ?? "");
  if (!name || !username || password.length < 6) {
    return NextResponse.json(
      { error: "Thiếu tên/tên đăng nhập, hoặc mật khẩu phải từ 6 ký tự" },
      { status: 400 },
    );
  }
  if (body?.role !== undefined && !ASSIGNABLE_ROLES.includes(body.role)) {
    return NextResponse.json({ error: "Vai trò không hợp lệ (không thể gán Manager)" }, { status: 400 });
  }
  const role: Role = ASSIGNABLE_ROLES.includes(body?.role) ? body.role : "STAFF";

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    return NextResponse.json({ error: "Tên đăng nhập đã tồn tại" }, { status: 409 });
  }

  const created = await prisma.user.create({
    data: {
      name,
      username,
      password: await hashPassword(password),
      role,
      permissions: Array.isArray(body?.permissions) ? body.permissions : [],
      // Manager/Assistant tạo trực tiếp thì được duyệt sẵn, không cần chờ.
      approved: true,
    },
    select: USER_SELECT,
  });
  return NextResponse.json({ user: created }, { status: 201 });
}
