import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { CopyButton } from "@/components/copy-button";
import {
  inviteMessageDirect,
  inviteMessageFriendly,
  inviteMessageShort,
} from "@/lib/planning/invite-messages";
import { prisma } from "@/lib/db/prisma";
import { getTemplateById } from "@/lib/planning/activity-templates";
import type { PlanSuggestion } from "@/lib/planning/types";
import { getDefaultUserId } from "@/lib/user/default-user";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string; inviteId: string }> };

export default async function InviteSharePage({ params }: Props) {
  const { id: friendId, inviteId } = await params;
  const userId = await getDefaultUserId();

  const invite = await prisma.invite.findFirst({
    where: { id: inviteId, friendId, friend: { userId } },
    include: { friend: true },
  });
  if (!invite) notFound();

  const hdrs = await headers();
  const host = hdrs.get("x-forwarded-host") ?? hdrs.get("host") ?? "";
  const proto = hdrs.get("x-forwarded-proto") ?? "https";
  const base = host ? `${proto}://${host}` : "";
  const publicUrl = `${base}/i/${invite.token}`;

  const slots = Array.isArray(invite.proposedSlots)
    ? (invite.proposedSlots as { iso: string; label: string }[])
    : [];
  const template = invite.templateId
    ? getTemplateById(invite.templateId)
    : undefined;
  const pseudo: Pick<PlanSuggestion, "title" | "proposedStartTimes"> = {
    title: template?.title ?? "Hang out",
    proposedStartTimes: slots,
  };

  const msgFriendly = inviteMessageFriendly(
    invite.friend.name,
    publicUrl,
    pseudo,
  );
  const msgShort = inviteMessageShort(invite.friend.name, publicUrl, pseudo);
  const msgDirect = inviteMessageDirect(publicUrl);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6">
      <Link
        href={`/friends/${friendId}/plan`}
        className="text-sm text-zinc-600 hover:text-foreground dark:text-zinc-400"
      >
        ← Back to plans
      </Link>
      <div>
        <h1 className="text-2xl font-semibold">Share invite</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Send this link to {invite.friend.name}. Status:{" "}
          <span className="font-medium text-foreground">{invite.status}</span>
          {invite.expiresAt ? (
            <span className="block text-xs text-zinc-500">
              Expires{" "}
              {invite.expiresAt.toLocaleDateString(undefined, {
                dateStyle: "medium",
              })}
            </span>
          ) : null}
        </p>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/30">
        <p className="text-xs font-medium text-zinc-500">Link</p>
        <p className="mt-1 break-all font-mono text-sm">{publicUrl}</p>
        <CopyButton
          text={publicUrl}
          label="Copy link"
          className="mt-3 rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background"
        />
      </div>

      <div className="space-y-4">
        <MessageBlock label="Friendly" text={msgFriendly} />
        <MessageBlock label="Short" text={msgShort} />
        <MessageBlock label="Direct" text={msgDirect} />
      </div>
    </main>
  );
}

function MessageBlock({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-zinc-500">{label}</p>
      <pre className="mt-1 whitespace-pre-wrap rounded-lg border border-zinc-200 bg-white p-3 text-xs dark:border-zinc-700 dark:bg-zinc-950">
        {text}
      </pre>
      <CopyButton
        text={text}
        label="Copy message"
        className="mt-2 text-xs font-medium text-foreground underline"
      />
    </div>
  );
}
