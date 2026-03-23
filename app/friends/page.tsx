import Link from "next/link";

export default function FriendsPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Friends
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Your list will show temperature and quick actions once connected to
            the database.
          </p>
        </div>
        <Link
          href="/friends/new"
          className="inline-flex w-fit items-center justify-center rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          Add friend
        </Link>
      </div>
      <div
        className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 py-16 text-center dark:border-zinc-700"
        role="status"
      >
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          No friends yet
        </p>
        <p className="mt-1 max-w-sm text-sm text-zinc-500 dark:text-zinc-500">
          Add someone you want to stay in rhythm with — cadence and warmth
          appear after Day 3–5 of the build plan.
        </p>
        <Link
          href="/friends/new"
          className="mt-6 text-sm font-medium text-foreground underline underline-offset-4"
        >
          Add your first friend
        </Link>
      </div>
    </main>
  );
}
