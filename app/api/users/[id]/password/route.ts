import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { canManageUsers } from "@/lib/permissions";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const currentUser = await getCurrentUser();
  if (!canManageUsers(currentUser)) {
    return NextResponse.json({ error: "Chỉ Manager/Assistant mới đổi mật khẩu user được" }, { status: 403 });
  }
  const { id } = await params;
  const target = await prisma.user.findUnique({ where: { id: Number(id) } });
  if (!target) return NextResponse.json({ error: "Không tìm thấy user" }, { status: 404 });
  if (target.role === "MANAGER") {
    return NextResponse.json({ error: "Không thể đổi mật khẩu tài khoản Manager" }, { status: 403 });
  }
  const body = await req.json().catch(() => null);
  const password = String(body?.password ?? "");
  if (password.length < 6) {
    return NextResponse.json({ error: "Mật khẩu phải từ 6 ký tự" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: Number(id) },
    data: { password: await hashPassword(password) },
  });
  return NextResponse.json({ ok: true });
}
