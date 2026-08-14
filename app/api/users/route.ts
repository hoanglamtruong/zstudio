import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { hashPassword } from "@/lib/password";

const USER_SELECT = {
  id: true,
  username: true,
  name: true,
  isLeader: true,
  permissions: true,
  active: true,
  createdAt: true,
};

export async function GET() {
  const user = await getCurrentUser();
  if (!user?.isLeader) {
    return NextResponse.json({ error: "Chỉ leader mới xem được" }, { status: 403 });
  }
  const users = await prisma.user.findMany({ select: USER_SELECT, orderBy: { id: "asc" } });
  return NextResponse.json({ users });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user?.isLeader) {
    return NextResponse.json({ error: "Chỉ leader mới tạo được user" }, { status: 403 });
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

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    return NextResponse.json({ error: "Tên đăng nhập đã tồn tại" }, { status: 409 });
  }

  const created = await prisma.user.create({
    data: {
      name,
      username,
      password: await hashPassword(password),
      isLeader: Boolean(body?.isLeader) || false,
      permissions: Array.isArray(body?.permissions) ? body.permissions : [],
    },
    select: USER_SELECT,
  });
  return NextResponse.json({ user: created }, { status: 201 });
}
