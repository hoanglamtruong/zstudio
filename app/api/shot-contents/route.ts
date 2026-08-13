import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission, SHOT_CONTENT_TYPE_TO_MODULE } from "@/lib/permissions";

const VALID_TYPES = Object.keys(SHOT_CONTENT_TYPE_TO_MODULE);

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const shotId = Number(body?.shotId);
  const type = String(body?.type ?? "");
  if (!shotId || !VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: "Thiếu shotId hoặc type không hợp lệ" }, { status: 400 });
  }
  const mod = SHOT_CONTENT_TYPE_TO_MODULE[type];
  if (!hasPermission(user, mod)) {
    return NextResponse.json({ error: `Không có quyền '${mod}'` }, { status: 403 });
  }

  const count = await prisma.shotContent.count({ where: { shotId } });
  const content = await prisma.shotContent.create({
    data: {
      shotId,
      type: type as never,
      character: String(body?.character ?? ""),
      text: String(body?.text ?? ""),
      order: count + 1,
    },
  });
  return NextResponse.json({ content }, { status: 201 });
}
