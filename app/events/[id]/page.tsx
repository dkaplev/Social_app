import Link from "next/link";
import { notFound } from "next/navigation";
import { submitEventFeedback } from "@/app/events/[id]/actions";
import { prisma } from "@/lib/db/prisma";
import { getDefaultUserId } from "@/lib/user/default-user";

export const dynamic = "force-dynamic";

const TAG_OPTIONS = [
  "too loud",
  "too far",
  "too long",
  "great vibe",
  "good value",
  "good talk",
  "awkward timing",
] as const;

type Props = { params: Promise<{ id: string }> };

export default async function EventFeedbackPage({ params }: Props) {
  const { id } = await params;
  const userId = await getDefaultUserId();

  const event = await prisma.event.findFirst({
    where: { id, invite: { friend: { userId } } },
    include: { invite: { include: { friend: true } } },
  });
  if (!event) notFound();

  const now = new Date();
  const canFeedback = event.endsAt < now;
  const existing = await prisma.feedback.findFirst({
    where: { eventId: event.id },
  });

  const icsApp = `/api/ics/event/${event.id}`;

  return (
    <main className="mx-auto max-w-lg px-4 py-10">
      <Link
        href={`/friends/${event.invite.friendId}`}
        className="text-sm text-zinc-600 hover:text-foreground dark:text-zinc-400"
      >
        ← {event.invite.friend.name}
      </Link>
      <h1 className="mt-4 text-2xl font-semibold">{event.title}</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        {event.startsAt.toLocaleString(undefined, {
          dateStyle: "full",
          timeStyle: "short",
        })}
      </p>
      <p className="mt-1 text-sm">{event.locationText}</p>
      <a
        href={icsApp}
        className="mt-4 inline-flex text-sm font-medium text-foreground underline"
      >
        Download .ics
      </a>

      {!canFeedback ? (
        <p className="mt-8 text-sm text-zinc-500">
          Feedback unlocks after this meetup time passes.
        </p>
      ) : existing ? (
        <p className="mt-8 text-sm text-zinc-600">
          Thanks — feedback for this hang is already saved.
        </p>
      ) : (
        <form action={submitEventFeedback} className="mt-8 space-y-6">
          <input type="hidden" name="eventId" value={event.id} />
          <fieldset>
            <legend className="text-sm font-medium">How was it?</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {(
                [
                  ["great", "Great"],
                  ["ok", "OK"],
                  ["no", "Not really"],
                ] as const
              ).map(([v, label]) => (
                <label
                  key={v}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm has-[:checked]:border-foreground dark:border-zinc-700"
                >
                  <input type="radio" name="rating" value={v} required />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="text-sm font-medium">Tags (optional)</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {TAG_OPTIONS.map((t) => (
                <label
                  key={t}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-200 px-2 py-1 text-xs capitalize dark:border-zinc-700"
                >
                  <input type="checkbox" name="tags" value={t} />
                  {t}
                </label>
              ))}
            </div>
          </fieldset>
          <button
            type="submit"
            className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background"
          >
            Save feedback
          </button>
        </form>
      )}
    </main>
  );
}
