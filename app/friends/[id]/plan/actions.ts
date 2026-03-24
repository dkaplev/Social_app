"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logAnalytics } from "@/lib/analytics";
import { prisma } from "@/lib/db/prisma";
import { createInviteToken } from "@/lib/invite/token";
import { generatePlanSuggestions } from "@/lib/planning/generate-plans";
import { getDefaultUserId } from "@/lib/user/default-user";

export async function weekdayAnswer(formData: FormData) {
  const friendId = formData.get("friendId")?.toString() ?? "";
  const answer = formData.get("answer")?.toString() ?? "skip";
  const userId = await getDefaultUserId();
  const friend = await prisma.friend.findFirst({
    where: { id: friendId, userId },
    include: { prefs: true },
  });
  if (!friend?.prefs) return;

  let v: boolean;
  if (answer === "yes") v = true;
  else if (answer === "no") v = false;
  else v = false;

  await prisma.friendPrefs.update({
    where: { friendId },
    data: { weekdayEveningsOk: v },
  });

  revalidatePath(`/friends/${friendId}/plan`);
}

export async function createInviteFromPlan(formData: FormData) {
  const friendId = formData.get("friendId")?.toString() ?? "";
  const templateId = formData.get("templateId")?.toString() ?? "";
  const slotsJson = formData.get("slotsJson")?.toString() ?? "";
  const durationMinutes = Number(formData.get("durationMinutes"));
  const recurring = formData.get("recurring") === "on";

  const userId = await getDefaultUserId();
  const friend = await prisma.friend.findFirst({
    where: { id: friendId, userId },
  });
  if (!friend) redirect("/friends");

  let proposedSlots: unknown;
  try {
    proposedSlots = JSON.parse(slotsJson) as unknown;
  } catch {
    redirect(`/friends/${friendId}/plan`);
  }

  if (!Number.isFinite(durationMinutes) || durationMinutes < 15) {
    redirect(`/friends/${friendId}/plan`);
  }

  const token = createInviteToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 14);

  const invite = await prisma.invite.create({
    data: {
      friendId,
      token,
      proposedSlots: proposedSlots as object,
      durationMinutes: Math.round(durationMinutes),
      templateId: templateId || null,
      recurringWanted: recurring,
      expiresAt,
    },
  });

  await logAnalytics("invite_created", {
    inviteId: invite.id,
    friendId,
    templateId,
  });
  revalidatePath(`/friends/${friendId}`);
  redirect(`/friends/${friendId}/invites/${invite.id}`);
}

export async function rescheduleInviteForm(formData: FormData) {
  const prevInviteId = formData.get("prevInviteId")?.toString() ?? "";
  if (!prevInviteId) redirect("/friends");
  await rescheduleInvite(prevInviteId);
}

export async function rescheduleInvite(prevInviteId: string) {
  const userId = await getDefaultUserId();
  const prev = await prisma.invite.findFirst({
    where: { id: prevInviteId, friend: { userId } },
    include: { friend: true, event: true },
  });
  if (!prev || prev.status !== "ACCEPTED" || !prev.event) {
    redirect("/friends");
  }

  const token = createInviteToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 14);

  const full = await prisma.friend.findFirst({
    where: { id: prev.friendId, userId },
    include: { prefs: true, pairModel: true },
  });
  if (!full) redirect("/friends");

  const { suggestions } = generatePlanSuggestions({
    name: full.name,
    prefs: full.prefs,
    pairWeightsJson: full.pairModel?.weights,
  });
  const match = suggestions.find((s) => s.templateId === prev.templateId);
  const slots = match?.proposedStartTimes ?? suggestions[0]?.proposedStartTimes ?? [];

  const invite = await prisma.invite.create({
    data: {
      friendId: prev.friendId,
      token,
      proposedSlots: slots as object,
      durationMinutes: prev.durationMinutes,
      templateId: prev.templateId,
      recurringWanted: prev.recurringWanted,
      expiresAt,
    },
  });

  await logAnalytics("invite_created", {
    inviteId: invite.id,
    friendId: prev.friendId,
    rescheduleFrom: prevInviteId,
  });
  revalidatePath(`/friends/${prev.friendId}`);
  redirect(`/friends/${prev.friendId}/invites/${invite.id}`);
}
