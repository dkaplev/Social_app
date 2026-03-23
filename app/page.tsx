import Link from "next/link";
import type { FriendTemperature } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { cadenceLabel } from "@/lib/friends/cadence";
import {
  computeFriendTemperature,
  temperatureSortKey,
} from "@/lib/friends/temperature";
import {
  temperatureLabel,
  temperatureStyles,
} from "@/lib/friends/temperature-display";
import { getDefaultUserId } from "@/lib/user/default-user";

export const dynamic = "force-dynamic";

function countBy(
  items: FriendTemperature[],
): Record<FriendTemperature, number> {
  return items.reduce(
    (acc, t) => {
      acc[t] += 1;
      return acc;
    },
    { WARM: 0, COOLING: 0, COLD: 0 },
  );
}

export default async function DashboardPage() {
  const userId = await getDefaultUserId();
  const friends = await prisma.friend.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  const enriched = friends.map((f) => ({
    friend: f,
    temperature: computeFriendTemperature(f),
  }));

  enriched.sort((a, b) => {
    const rk = temperatureSortKey(a.temperature) - temperatureSortKey(b.temperature);
    if (rk !== 0) return rk;
    return a.friend.name.localeCompare(b.friend.name);
  });

  const counts = countBy(enriched.map((e) => e.temperature));

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-4 py-10 sm:px-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="mt-2 max-w-xl text-sm text-zinc-600 dark:text-zinc-400">
          Temperature is computed from last time you met and your cadence — coldest
          friends surface first.
        </p>
      </div>

      {friends.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-6 dark:border-zinc-800 dark:bg-zinc-900/30">
          <p className="text-sm text-zinc-700 dark:text-zinc-300">
            No friends yet — add someone to see warmth and planning shortcuts.
          </p>
          <Link
            href="/friends/new"
            className="mt-4 inline-flex items-center rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            Add a friend
          </Link>
        </div>
      ) : (
        <>
          <section aria-label="Temperature summary">
            <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-500">
              This week at a glance
            </h2>
            <div className="mt-3 grid grid-cols-3 gap-3 sm:max-w-md">
              <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/40">
                <p className="text-2xl font-semibold tabular-nums text-emerald-700 dark:text-emerald-300">
                  {counts.WARM}
                </p>
                <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Warm
                </p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/40">
                <p className="text-2xl font-semibold tabular-nums text-amber-800 dark:text-amber-200">
                  {counts.COOLING}
                </p>
                <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Cooling
                </p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/40">
                <p className="text-2xl font-semibold tabular-nums text-zinc-800 dark:text-zinc-200">
                  {counts.COLD}
                </p>
                <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Cold
                </p>
              </div>
            </div>
          </section>

          <section aria-label="Friends by priority">
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-lg font-semibold text-foreground">Friends</h2>
              <Link
                href="/friends"
                className="text-sm font-medium text-zinc-600 hover:text-foreground dark:text-zinc-400"
              >
                All friends
              </Link>
            </div>
            <ul className="mt-4 flex flex-col gap-3">
              {enriched.map(({ friend: f, temperature }) => (
                <li
                  key={f.id}
                  className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-4 dark:border-zinc-800 dark:bg-zinc-950/40 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/friends/${f.id}`}
                        className="font-medium text-foreground hover:underline"
                      >
                        {f.name}
                      </Link>
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${temperatureStyles(temperature)}`}
                      >
                        {temperatureLabel(temperature)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-500">
                      {cadenceLabel(f.cadenceDays)} · {f.cadenceDays}d cadence
                      {f.lastMetAt
                        ? ` · last met ${f.lastMetAt.toLocaleDateString(undefined, {
                            dateStyle: "medium",
                          })}`
                        : " · last met not set"}
                    </p>
                  </div>
                  <Link
                    href={`/friends/${f.id}/plan`}
                    className="inline-flex shrink-0 items-center justify-center rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
                  >
                    Plan this week
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </main>
  );
}
