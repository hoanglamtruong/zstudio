import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

// Đăng ký công khai: tài khoản mới luôn tạo với role STAFF, chờ Manager
// duyệt (approved=false) trước khi đăng nhập được. Manager có thể nâng lên
// Admin sau khi duyệt, trong trang Quản lý user.
export async function POST(req: NextRequest) {
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

  await prisma.user.create({
    data: {
      name,
      username,
      password: await hashPassword(password),
      role: "STAFF",
      approved: false,
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
