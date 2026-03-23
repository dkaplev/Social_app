import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { cadenceLabel } from "@/lib/friends/cadence";
import { computeFriendTemperature } from "@/lib/friends/temperature";
import {
  temperatureLabel,
  temperatureStyles,
} from "@/lib/friends/temperature-display";
import { getDefaultUserId } from "@/lib/user/default-user";

export const dynamic = "force-dynamic";

export default async function FriendsPage() {
  const userId = await getDefaultUserId();
  const friends = await prisma.friend.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Friends
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Temperature updates from cadence and last met — see dashboard for
            priority order.
          </p>
        </div>
        <Link
          href="/friends/new"
          className="inline-flex w-fit items-center justify-center rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          Add friend
        </Link>
      </div>

      {friends.length === 0 ? (
        <div
          className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 py-16 text-center dark:border-zinc-700"
          role="status"
        >
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            No friends yet
          </p>
          <p className="mt-1 max-w-sm text-sm text-zinc-500 dark:text-zinc-500">
            Add someone you want to stay in rhythm with.
          </p>
          <Link
            href="/friends/new"
            className="mt-6 text-sm font-medium text-foreground underline underline-offset-4"
          >
            Add your first friend
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {friends.map((f) => {
            const temperature = computeFriendTemperature(f);
            return (
              <li key={f.id}>
                <Link
                  href={`/friends/${f.id}`}
                  className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-4 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/40 dark:hover:border-zinc-600 dark:hover:bg-zinc-900/50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-foreground">{f.name}</p>
                    <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-500">
                      {cadenceLabel(f.cadenceDays)} · {f.cadenceDays}d target
                      {f.lastMetAt
                        ? ` · last met ${f.lastMetAt.toLocaleDateString(undefined, {
                            dateStyle: "medium",
                          })}`
                        : " · last met — not set"}
                    </p>
                  </div>
                  <span
                    className={`inline-flex w-fit rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${temperatureStyles(temperature)}`}
                  >
                    {temperatureLabel(temperature)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
