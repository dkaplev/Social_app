import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export type AnalyticsName =
  | "friend_created"
  | "plan_generated"
  | "invite_created"
  | "invite_opened"
  | "invite_accepted"
  | "ics_downloaded"
  | "feedback_submitted";

export async function logAnalytics(name: AnalyticsName, meta?: Record<string, unknown>) {
  try {
    await prisma.analyticsEvent.create({
      data: {
        name,
        meta: (meta ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });
  } catch {
    /* non-fatal if DB missing in edge cases */
  }
}
