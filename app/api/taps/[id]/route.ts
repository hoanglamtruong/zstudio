import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  if (!hasPermission(user, "tapinfo")) {
    return NextResponse.json({ error: "Không có quyền 'tapinfo'" }, { status: 403 });
  }
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const data: Record<string, unknown> = {};
  if (typeof body?.title === "string") data.title = body.title;
  if (typeof body?.summary === "string") data.summary = body.summary;
  if (Array.isArray(body?.locations)) data.locations = body.locations;
  if (Array.isArray(body?.equipment)) data.equipment = body.equipment;
  if (Array.isArray(body?.costumes)) data.costumes = body.costumes;

  // Ẩn/hiện Tập là thao tác cấu trúc: chỉ leader (giống add/delete Tập).
  if (typeof body?.active === "boolean") {
    if (!user.isLeader) {
      return NextResponse.json({ error: "Chỉ leader mới ẩn/hiện Tập được" }, { status: 403 });
    }
    data.active = body.active;
  }

  const tap = await prisma.tap.update({ where: { id: Number(id) }, data });
  return NextResponse.json({ tap });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  if (!user.isLeader) {
    return NextResponse.json({ error: "Chỉ leader mới xóa Tập được" }, { status: 403 });
  }
  const { id } = await params;
  await prisma.tap.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
