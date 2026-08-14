import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// Thêm Tập là thao tác cấu trúc: chỉ leader được thêm (theo spec), khác với
// sửa nội dung Tập (PATCH) vốn chỉ cần quyền 'tapinfo'.
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  if (!user.isLeader) {
    return NextResponse.json({ error: "Chỉ leader mới thêm Tập được" }, { status: 403 });
  }
  const body = await req.json().catch(() => null);
  const projectId = Number(body?.projectId);
  const title = String(body?.title ?? "").trim();
  if (!projectId || !title) return NextResponse.json({ error: "Thiếu projectId/title" }, { status: 400 });

  const count = await prisma.tap.count({ where: { projectId } });
  const tap = await prisma.tap.create({
    data: {
      projectId,
      title,
      summary: String(body?.summary ?? ""),
      locations: Array.isArray(body?.locations) ? body.locations : [],
      equipment: Array.isArray(body?.equipment) ? body.equipment : [],
      costumes: Array.isArray(body?.costumes) ? body.costumes : [],
      order: count + 1,
      createdById: user.id,
      createdByName: user.name,
    },
  });
  return NextResponse.json({ tap }, { status: 201 });
}
