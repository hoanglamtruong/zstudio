import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  if (!hasPermission(user, "canh")) {
    return NextResponse.json({ error: "Không có quyền 'canh'" }, { status: 403 });
  }
  const body = await req.json().catch(() => null);
  const tapId = Number(body?.tapId);
  const title = String(body?.title ?? "").trim();
  if (!tapId || !title) return NextResponse.json({ error: "Thiếu tapId/title" }, { status: 400 });

  const count = await prisma.scene.count({ where: { tapId } });
  const scene = await prisma.scene.create({
    data: {
      tapId,
      title,
      space: String(body?.space ?? ""),
      time: String(body?.time ?? ""),
      charactersPresent: Array.isArray(body?.charactersPresent) ? body.charactersPresent : [],
      order: count + 1,
    },
  });
  return NextResponse.json({ scene }, { status: 201 });
}
