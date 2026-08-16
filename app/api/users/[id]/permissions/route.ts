import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { PERMISSION_MODULES, canAssignStaffPermissions } from "@/lib/permissions";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const currentUser = await getCurrentUser();
  if (!canAssignStaffPermissions(currentUser)) {
    return NextResponse.json({ error: "Chỉ Manager/Admin mới gán quyền được" }, { status: 403 });
  }
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const permissions = Array.isArray(body?.permissions) ? body.permissions : null;
  if (!permissions || !permissions.every((p: unknown) => typeof p === "string" && PERMISSION_MODULES.includes(p as never))) {
    return NextResponse.json({ error: "permissions không hợp lệ" }, { status: 400 });
  }
  const updated = await prisma.user.update({
    where: { id: Number(id) },
    data: { permissions },
  });
  return NextResponse.json({ user: updated });
}
