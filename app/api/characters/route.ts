import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  if (!hasPermission(user, "nhanvat")) {
    return NextResponse.json({ error: "Không có quyền 'nhanvat'" }, { status: 403 });
  }
  const body = await req.json().catch(() => null);
  const projectId = Number(body?.projectId);
  const name = String(body?.name ?? "").trim();
  if (!projectId || !name) return NextResponse.json({ error: "Thiếu projectId/name" }, { status: 400 });

  const character = await prisma.character.create({
    data: {
      projectId,
      name,
      desc: String(body?.desc ?? ""),
      createdById: user.id,
      createdByName: user.name,
    },
  });
  return NextResponse.json({ character }, { status: 201 });
}
