import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { submitCounterNote, submitInviteAccept } from "@/app/i/[token]/actions";
import { logAnalytics } from "@/lib/analytics";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ token: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PublicInvitePage({ params, searchParams }: PageProps) {
  const { token } = await params;
  const sp = await searchParams;
  const err = typeof sp.error === "string" ? sp.error : undefined;
  const confirmed = sp.confirmed === "1" || sp.confirmed === "true";

  const invite = await prisma.invite.findUnique({
    where: { token },
    include: { friend: true, event: true },
  });

  if (!invite) notFound();

  await logAnalytics("invite_opened", { inviteId: invite.id });

  const hdrs = await headers();
  const host = hdrs.get("x-forwarded-host") ?? hdrs.get("host") ?? "";
  const proto = hdrs.get("x-forwarded-proto") ?? "https";
  const base = host ? `${proto}://${host}` : "";
  const icsHref = `${base}/api/ics?token=${encodeURIComponent(token)}`;

  const expired = invite.expiresAt != null && invite.expiresAt < new Date();
  const slots = Array.isArray(invite.proposedSlots)
    ? (invite.proposedSlots as { iso: string; label: string }[])
    : [];

  if (expired) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-xl font-semibold">This invite expired</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Ask your friend to send a fresh link.
        </p>
      </main>
    );
  }

  if (invite.status === "ACCEPTED" && invite.event) {
    const e = invite.event;
    return (
      <main className="mx-auto max-w-lg px-4 py-12">
        <h1 className="text-2xl font-semibold">You’re on</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {e.title}
        </p>
        <p className="mt-4 text-sm">
          {e.startsAt.toLocaleString(undefined, {
            dateStyle: "full",
            timeStyle: "short",
          })}
        </p>
        <p className="mt-1 text-sm text-zinc-600">{e.locationText}</p>
        <a
          href={icsHref}
          className="mt-6 inline-flex rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background"
        >
          Add to calendar (.ics)
        </a>
        {confirmed ? (
          <p className="mt-4 text-sm text-emerald-700 dark:text-emerald-300">
            Saved. Calendar file downloads when you tap the button.
          </p>
        ) : null}
      </main>
    );
  }

  if (invite.status !== "PENDING") {
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-xl font-semibold">Invite closed</h1>
        <p className="mt-2 text-sm text-zinc-600">This link is no longer active.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-10">
      <p className="text-sm text-zinc-500">Invite from a friend</p>
      <h1 className="mt-1 text-2xl font-semibold">
        Pick a time with {invite.friend.name}
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Choose one slot that works. No account needed.
      </p>

      {err === "slot" ? (
        <p className="mt-4 text-sm text-red-600" role="alert">
          Please select a time option.
        </p>
      ) : null}
      {err === "done" ? (
        <p className="mt-4 text-sm text-amber-800 dark:text-amber-200">
          This invite was already accepted.
        </p>
      ) : null}
      {err === "expired" ? (
        <p className="mt-4 text-sm text-red-600" role="alert">
          This invite has expired.
        </p>
      ) : null}

      <form action={submitInviteAccept} className="mt-6 space-y-3">
        <input type="hidden" name="token" value={token} />
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Times</legend>
          {slots.map((s) => (
            <label
              key={s.iso}
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-700"
            >
              <input type="radio" name="slot" value={s.iso} required />
              <span className="text-sm">{s.label}</span>
            </label>
          ))}
        </fieldset>
        <button
          type="submit"
          className="w-full rounded-lg bg-foreground py-2.5 text-sm font-medium text-background"
        >
          This works
        </button>
      </form>

      <div className="mt-10 border-t border-zinc-200 pt-8 dark:border-zinc-800">
        <h2 className="text-sm font-medium">Suggest another time</h2>
        <p className="mt-1 text-xs text-zinc-500">
          Optional note — your friend will see it in Warm.
        </p>
        <form action={submitCounterNote} className="mt-3 space-y-2">
          <input type="hidden" name="token" value={token} />
          <textarea
            name="note"
            rows={3}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
            placeholder="e.g. Only free Sunday afternoons…"
          />
          <button
            type="submit"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-600"
          >
            Send note
          </button>
        </form>
      </div>

      <p className="mt-10 text-center text-xs text-zinc-400">
        Powered by{" "}
        <Link href="/" className="underline">
          Warm
        </Link>
      </p>
    </main>
  );
}
