import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user?.isLeader) {
    return NextResponse.json({ error: "Chỉ leader mới xem được" }, { status: 403 });
  }
  const users = await prisma.user.findMany({ orderBy: { id: "asc" } });
  return NextResponse.json({ users });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user?.isLeader) {
    return NextResponse.json({ error: "Chỉ leader mới tạo được user" }, { status: 403 });
  }
  const body = await req.json().catch(() => null);
  const name = String(body?.name ?? "").trim();
  if (!name) {
    return NextResponse.json({ error: "Thiếu tên" }, { status: 400 });
  }
  const created = await prisma.user.create({
    data: {
      name,
      isLeader: Boolean(body?.isLeader) || false,
      permissions: Array.isArray(body?.permissions) ? body.permissions : [],
    },
  });
  return NextResponse.json({ user: created }, { status: 201 });
}
