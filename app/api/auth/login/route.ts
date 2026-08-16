import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { verifyPassword } from "@/lib/password";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const username = String(body?.username ?? "").trim();
  const password = String(body?.password ?? "");
  if (!username || !password) {
    return NextResponse.json({ error: "Thiếu tên đăng nhập/mật khẩu" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !(await verifyPassword(password, user.password))) {
    return NextResponse.json({ error: "Sai tên đăng nhập hoặc mật khẩu" }, { status: 401 });
  }
  if (!user.active) {
    return NextResponse.json({ error: "Tài khoản đã bị vô hiệu hóa" }, { status: 403 });
  }
  if (!user.approved) {
    return NextResponse.json({ error: "Tài khoản đang chờ Manager duyệt" }, { status: 403 });
  }

  const session = await getSession();
  session.userId = user.id;
  await session.save();

  return NextResponse.json({ user: { id: user.id, name: user.name, role: user.role } });
}
