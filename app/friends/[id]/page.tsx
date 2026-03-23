import Link from "next/link";
import { notFound } from "next/navigation";
import { FriendPrefsForm } from "@/app/friends/[id]/friend-prefs-form";
import { prisma } from "@/lib/db/prisma";
import { cadenceLabel } from "@/lib/friends/cadence";
import { parseStringArray } from "@/lib/friends/pref-options";
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

  const friend = await prisma.friend.findFirst({
    where: { id, userId },
    include: { prefs: true },
  });

  if (!friend) {
    notFound();
  }

  const p = friend.prefs;
  const initial = {
    durationBand: p?.durationBand ?? "90m",
    maxTravelMinutes: p?.maxTravelMinutes ?? 30,
    budgetBand: p?.budgetBand ?? "mid",
    vibeQuietLively: p?.vibeQuietLively ?? 50,
    categories: parseStringArray(p?.categories),
    avoidTags: parseStringArray(p?.avoidTags),
  };

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
          <div>
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
          <span
            className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-medium ${temperatureStyles(friend.temperature)}`}
          >
            {temperatureLabel(friend.temperature)}
          </span>
        </div>
      </div>

      <section className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-6 dark:border-zinc-800 dark:bg-zinc-900/30">
        <h2 className="text-lg font-semibold text-foreground">
          Planning preferences
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Used when generating hang ideas (Day 7+).
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
