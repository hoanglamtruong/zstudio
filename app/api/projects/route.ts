import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  const projects = await prisma.project.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ projects });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const title = String(body?.title ?? "").trim();
  if (!title) return NextResponse.json({ error: "Thiếu tên dự án" }, { status: 400 });
  const project = await prisma.project.create({
    data: { title, createdById: user.id, createdByName: user.name },
  });
  return NextResponse.json({ project }, { status: 201 });
}
