import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// Never selects `password` — this value flows into client component props
// (Nav, ProjectEditor) and would otherwise leak the hash into the RSC payload.
export async function getCurrentUser() {
  const session = await getSession();
  if (!session.userId) return null;
  return prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, username: true, name: true, role: true, permissions: true, active: true, approved: true, createdAt: true },
  });
}
