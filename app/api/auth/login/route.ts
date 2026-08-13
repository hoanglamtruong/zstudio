import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// Danh sách rút gọn (id + name) để màn hình đăng nhập chọn user — không lộ
// permissions/isLeader, khác với GET /api/users (leader only, đầy đủ dữ liệu).
export async function GET() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true },
    orderBy: { id: "asc" },
  });
  return NextResponse.json({ users });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const userId = Number(body?.userId);
  if (!userId) {
    return NextResponse.json({ error: "Thiếu userId" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "Không tìm thấy user" }, { status: 404 });
  }

  const session = await getSession();
  session.userId = user.id;
  await session.save();

  return NextResponse.json({ user });
}
