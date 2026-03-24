import { logAnalytics } from "@/lib/analytics";
import { buildEventIcs } from "@/lib/calendar/ics";
import { prisma } from "@/lib/db/prisma";
import { getDefaultUserId } from "@/lib/user/default-user";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ eventId: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { eventId } = await params;
  const userId = await getDefaultUserId();

  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      invite: { friend: { userId } },
    },
    include: { invite: { include: { friend: true } } },
  });

  if (!event) {
    return new Response("Not found", { status: 404 });
  }

  const ics = buildEventIcs({
    uid: `${event.id}@warm.app`,
    start: event.startsAt,
    end: event.endsAt,
    summary: event.title,
    description: `Warm · ${event.invite.friend.name}`,
    location: event.locationText,
  });

  await logAnalytics("ics_downloaded", { eventId: event.id, source: "app" });

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="warm-meetup.ics"',
    },
  });
}
