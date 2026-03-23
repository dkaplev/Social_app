import { prisma } from "@/lib/db/prisma";

/** Phase 1: single-user mode — first user in DB, or create one. */
export async function getDefaultUserId(): Promise<string> {
  const existing = await prisma.user.findFirst({
    orderBy: { createdAt: "asc" },
  });
  if (existing) return existing.id;
  const created = await prisma.user.create({ data: {} });
  return created.id;
}
