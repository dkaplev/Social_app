"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logAnalytics } from "@/lib/analytics";
import { prisma } from "@/lib/db/prisma";
import { getTemplateById } from "@/lib/planning/activity-templates";

export async function submitCounterNote(formData: FormData) {
  const token = formData.get("token")?.toString() ?? "";
  const note = formData.get("note")?.toString().trim() ?? "";
  const inv = await prisma.invite.findUnique({ where: { token } });
  if (!inv || inv.status !== "PENDING") return;
  await prisma.invite.update({
    where: { id: inv.id },
    data: { counterNote: note || null },
  });
  revalidatePath(`/i/${token}`);
}

export async function submitInviteAccept(formData: FormData) {
  const token = formData.get("token")?.toString() ?? "";
  const slotIso = formData.get("slot")?.toString() ?? "";

  const inv = await prisma.invite.findUnique({
    where: { token },
    include: { friend: true, event: true },
  });

  if (!inv) redirect(`/i/${token}?error=notfound`);
  if (inv.expiresAt && inv.expiresAt < new Date()) {
    redirect(`/i/${token}?error=expired`);
  }
  if (inv.event || inv.status === "ACCEPTED") {
    redirect(`/i/${token}?error=done`);
  }
  if (inv.status !== "PENDING") redirect(`/i/${token}?error=state`);

  const slots = inv.proposedSlots as { iso?: string; label?: string }[];
  const match = Array.isArray(slots)
    ? slots.find((s) => s.iso === slotIso)
    : undefined;
  if (!slotIso || !match) redirect(`/i/${token}?error=slot`);

  const startsAt = new Date(slotIso);
  if (Number.isNaN(startsAt.getTime())) redirect(`/i/${token}?error=slot`);

  const endsAt = new Date(
    startsAt.getTime() + inv.durationMinutes * 60_000,
  );

  const template = inv.templateId ? getTemplateById(inv.templateId) : undefined;
  const locationText =
    template?.locationBlurb ?? "Somewhere convenient for both of you";

  await prisma.$transaction(async (tx) => {
    await tx.invite.update({
      where: { id: inv.id },
      data: {
        status: "ACCEPTED",
        chosenSlot: { iso: slotIso, label: match.label ?? "" } as object,
      },
    });
    await tx.event.create({
      data: {
        inviteId: inv.id,
        startsAt,
        endsAt,
        title: `Meetup with ${inv.friend.name}`,
        locationText,
        templateId: inv.templateId,
      },
    });
  });

  await logAnalytics("invite_accepted", {
    inviteId: inv.id,
    friendId: inv.friendId,
  });
  revalidatePath(`/i/${token}`);
  revalidatePath(`/friends/${inv.friendId}`);
  revalidatePath("/");
  redirect(`/i/${token}?confirmed=1`);
}
