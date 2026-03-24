import { logAnalytics } from "@/lib/analytics";
import { buildEventIcs } from "@/lib/calendar/ics";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  if (!token) {
    return new Response("Missing token", { status: 400 });
  }

  const invite = await prisma.invite.findFirst({
    where: { token, status: "ACCEPTED" },
    include: { event: true, friend: true },
  });

  if (!invite?.event) {
    return new Response("Not found", { status: 404 });
  }

  const e = invite.event;
  const ics = buildEventIcs({
    uid: `${e.id}@warm.app`,
    start: e.startsAt,
    end: e.endsAt,
    summary: e.title,
    description: `Warm invite · ${invite.friend.name}`,
    location: e.locationText,
  });

  await logAnalytics("ics_downloaded", { eventId: e.id, inviteId: invite.id });

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="warm-meetup.ics"',
    },
  });
}
