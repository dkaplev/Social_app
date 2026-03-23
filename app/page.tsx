import Link from "next/link";

export default function DashboardPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="mt-2 max-w-xl text-sm text-zinc-600 dark:text-zinc-400">
          Phase 1: friend temperature, plan suggestions, invite links, and ICS
          export will live here.
        </p>
      </div>
      <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-6 dark:border-zinc-800 dark:bg-zinc-900/30">
        <p className="text-sm text-zinc-700 dark:text-zinc-300">
          No data yet — add friends to see warmth and planning next steps.
        </p>
        <Link
          href="/friends/new"
          className="mt-4 inline-flex items-center rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          Add a friend
        </Link>
      </div>
    </main>
  );
}
