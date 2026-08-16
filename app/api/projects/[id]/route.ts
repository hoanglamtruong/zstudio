import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { hasFullAccess, hasPermission } from "@/lib/permissions";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });

  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id: Number(id) },
    include: {
      characters: true,
      taps: {
        orderBy: { order: "asc" },
        include: {
          scenes: {
            orderBy: { order: "asc" },
            include: {
              shots: {
                orderBy: { order: "asc" },
                include: {
                  contents: { orderBy: { order: "asc" } },
                  frames: { orderBy: { order: "asc" } },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!project) return NextResponse.json({ error: "Không tìm thấy dự án" }, { status: 404 });
  return NextResponse.json({ project });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  if (!hasPermission(user, "tapinfo")) {
    return NextResponse.json({ error: "Không có quyền 'tapinfo'" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const data: { mainPlot?: string } = {};
  if (typeof body?.mainPlot === "string") data.mainPlot = body.mainPlot;

  const project = await prisma.project.update({ where: { id: Number(id) }, data });
  return NextResponse.json({ project });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });

  const { id } = await params;
  const project = await prisma.project.findUnique({ where: { id: Number(id) } });
  if (!project) return NextResponse.json({ error: "Không tìm thấy dự án" }, { status: 404 });

  if (!hasFullAccess(user) && user.id !== project.createdById) {
    return NextResponse.json({ error: "Bạn không có quyền xóa dự án này" }, { status: 403 });
  }

  await prisma.project.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
