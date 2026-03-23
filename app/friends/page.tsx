import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { cadenceLabel } from "@/lib/friends/cadence";
import { getDefaultUserId } from "@/lib/user/default-user";

export const dynamic = "force-dynamic";

function temperatureStyles(t: string) {
  switch (t) {
    case "WARM":
      return "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200";
    case "COOLING":
      return "bg-amber-100 text-amber-950 dark:bg-amber-950/40 dark:text-amber-100";
    default:
      return "bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200";
  }
}

function temperatureLabel(t: string) {
  switch (t) {
    case "WARM":
      return "Warm";
    case "COOLING":
      return "Cooling";
    default:
      return "Cold";
  }
}

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
            Stored on your database — temperature rules land in Day 5.
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
          {friends.map((f) => (
            <li
              key={f.id}
              className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-4 dark:border-zinc-800 dark:bg-zinc-950/40 sm:flex-row sm:items-center sm:justify-between"
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
                className={`inline-flex w-fit rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${temperatureStyles(f.temperature)}`}
              >
                {temperatureLabel(f.temperature)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
