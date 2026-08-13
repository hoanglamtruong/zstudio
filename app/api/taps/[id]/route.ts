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

  const tap = await prisma.tap.update({ where: { id: Number(id) }, data });
  return NextResponse.json({ tap });
}
