import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

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
