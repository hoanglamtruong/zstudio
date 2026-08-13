import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  if (!hasPermission(user, "nhanvat")) {
    return NextResponse.json({ error: "Không có quyền 'nhanvat'" }, { status: 403 });
  }
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const data: { name?: string; desc?: string } = {};
  if (typeof body?.name === "string") data.name = body.name;
  if (typeof body?.desc === "string") data.desc = body.desc;

  const character = await prisma.character.update({ where: { id: Number(id) }, data });
  return NextResponse.json({ character });
}
