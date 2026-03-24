import Link from "next/link";

export default function HowPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/" className="text-sm text-zinc-600 hover:underline">
        ← Dashboard
      </Link>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight">
        How to use Warm
      </h1>
      <ol className="mt-8 list-decimal space-y-4 pl-5 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
        <li>
          Add friends and set cadence — Warm estimates how “warm” the
          relationship feels from when you last met.
        </li>
        <li>
          Tune planning prefs (vibe, budget, duration, categories) so
          suggestions match how you actually hang out.
        </li>
        <li>
          From the dashboard or a friend’s page, open <strong>Plan this week</strong>{" "}
          to get three ranked ideas with times.
        </li>
        <li>
          <strong>Create invite</strong> copies a link you send over WhatsApp or
          Telegram. They pick a slot without installing anything.
        </li>
        <li>
          After they confirm, download the <strong>.ics</strong> file for your
          calendar. After the meetup, leave quick feedback — Warm learns soft
          preferences for next time.
        </li>
        <li>
          Use <strong>Reschedule</strong> on an upcoming hang to spin up a fresh
          invite with new slots.
        </li>
      </ol>
      <p className="mt-10 text-sm text-zinc-500">
        Phase 1 is rules + light learning — no full calendar sync yet.
      </p>
    </main>
  );
}
