import Link from "next/link";
import { notFound } from "next/navigation";
import { FriendPrefsForm } from "@/app/friends/[id]/friend-prefs-form";
import { rescheduleInviteForm } from "@/app/friends/[id]/plan/actions";
import { prisma } from "@/lib/db/prisma";
import { cadenceLabel } from "@/lib/friends/cadence";
import { parseStringArray } from "@/lib/friends/pref-options";
import { computeFriendTemperature } from "@/lib/friends/temperature";
import {
  temperatureLabel,
  temperatureStyles,
} from "@/lib/friends/temperature-display";
import { getDefaultUserId } from "@/lib/user/default-user";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

export default async function FriendDetailPage({ params }: PageProps) {
  const { id } = await params;
  const userId = await getDefaultUserId();
  const now = new Date();

  const friend = await prisma.friend.findFirst({
    where: { id, userId },
    include: { prefs: true },
  });

  if (!friend) {
    notFound();
  }

  const [invites, upcoming, latestPast, feedbacks] = await Promise.all([
    prisma.invite.findMany({
      where: { friendId: id },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { event: true },
    }),
    prisma.event.findFirst({
      where: {
        invite: { friendId: id, status: "ACCEPTED" },
        startsAt: { gte: now },
      },
      orderBy: { startsAt: "asc" },
      include: { invite: true },
    }),
    prisma.event.findFirst({
      where: {
        invite: { friendId: id },
        endsAt: { lt: now },
      },
      orderBy: { endsAt: "desc" },
      include: { invite: true },
    }),
    prisma.feedback.findMany({
      where: { friendId: id },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { event: true },
    }),
  ]);

  const p = friend.prefs;
  const initial = {
    durationBand: p?.durationBand ?? "90m",
    maxTravelMinutes: p?.maxTravelMinutes ?? 30,
    budgetBand: p?.budgetBand ?? "mid",
    vibeQuietLively: p?.vibeQuietLively ?? 50,
    categories: parseStringArray(p?.categories),
    avoidTags: parseStringArray(p?.avoidTags),
  };

  const temperature = computeFriendTemperature(friend);

  const prefsFormKey = [
    initial.durationBand,
    initial.maxTravelMinutes,
    initial.budgetBand,
    initial.vibeQuietLively,
    [...initial.categories].sort().join(","),
    [...initial.avoidTags].sort().join(","),
  ].join("|");

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6">
      <div>
        <Link
          href="/friends"
          className="text-sm font-medium text-zinc-600 underline-offset-4 hover:text-foreground hover:underline dark:text-zinc-400"
        >
          ← Friends
        </Link>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {friend.name}
            </h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              {cadenceLabel(friend.cadenceDays)} · {friend.cadenceDays} day
              cadence
              {friend.lastMetAt
                ? ` · last met ${friend.lastMetAt.toLocaleDateString(undefined, {
                    dateStyle: "medium",
                  })}`
                : " · last met not set"}
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
            <span
              className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-medium ${temperatureStyles(temperature)}`}
            >
              {temperatureLabel(temperature)}
            </span>
            <Link
              href={`/friends/${friend.id}/plan`}
              className="inline-flex items-center justify-center rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background hover:opacity-90"
            >
              Plan this week
            </Link>
          </div>
        </div>
      </div>

      <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950/40">
        <h2 className="text-lg font-semibold text-foreground">Meetups</h2>
        {upcoming ? (
          <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
            <p className="text-sm font-medium text-foreground">Upcoming</p>
            <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
              {upcoming.title} ·{" "}
              {upcoming.startsAt.toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href={`/api/ics/event/${upcoming.id}`}
                className="text-xs font-medium text-foreground underline"
              >
                Calendar file
              </Link>
              <Link
                href={`/events/${upcoming.id}`}
                className="text-xs font-medium text-foreground underline"
              >
                Details / feedback
              </Link>
              <form action={rescheduleInviteForm}>
                <input
                  type="hidden"
                  name="prevInviteId"
                  value={upcoming.inviteId}
                />
                <button
                  type="submit"
                  className="text-xs font-medium text-zinc-600 underline dark:text-zinc-400"
                >
                  Reschedule
                </button>
              </form>
            </div>
          </div>
        ) : (
          <p className="mt-2 text-sm text-zinc-500">No upcoming confirmed hang.</p>
        )}

        {latestPast ? (
          <p className="mt-4 text-sm">
            <Link
              href={`/events/${latestPast.id}`}
              className="font-medium text-foreground underline"
            >
              Last hang feedback
            </Link>
            <span className="text-zinc-500">
              {" "}
              · ended{" "}
              {latestPast.endsAt.toLocaleDateString(undefined, {
                dateStyle: "medium",
              })}
            </span>
          </p>
        ) : null}

        <h3 className="mt-6 text-sm font-medium text-zinc-500">Invites</h3>
        <ul className="mt-2 space-y-2 text-sm">
          {invites.length === 0 ? (
            <li className="text-zinc-500">None yet — start from Plan.</li>
          ) : (
            invites.map((inv) => (
              <li
                key={inv.id}
                className="flex flex-col gap-1 rounded-md border border-zinc-100 px-3 py-2 dark:border-zinc-800"
              >
                <span className="font-medium">{inv.status}</span>
                {inv.status === "PENDING" ? (
                  <Link
                    href={`/friends/${friend.id}/invites/${inv.id}`}
                    className="text-xs text-foreground underline"
                  >
                    Open share link
                  </Link>
                ) : null}
                {inv.counterNote ? (
                  <span className="text-xs text-zinc-600">
                    Their note: {inv.counterNote}
                  </span>
                ) : null}
              </li>
            ))
          )}
        </ul>
      </section>

      {feedbacks.length > 0 ? (
        <section className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-6 dark:border-zinc-800 dark:bg-zinc-900/30">
          <h2 className="text-lg font-semibold text-foreground">
            Recent feedback
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
            {feedbacks.map((fb) => (
              <li key={fb.id}>
                Rating {fb.rating}
                {Array.isArray(fb.tags) && (fb.tags as string[]).length > 0
                  ? ` · ${(fb.tags as string[]).join(", ")}`
                  : ""}{" "}
                ·{" "}
                {fb.createdAt.toLocaleDateString(undefined, {
                  dateStyle: "medium",
                })}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-6 dark:border-zinc-800 dark:bg-zinc-900/30">
        <h2 className="text-lg font-semibold text-foreground">
          Planning preferences
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Used when generating hang ideas.
        </p>
        <div className="mt-6">
          <FriendPrefsForm
            key={prefsFormKey}
            friendId={friend.id}
            initial={initial}
          />
        </div>
      </section>
    </main>
  );
}
