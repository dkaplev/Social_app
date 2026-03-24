"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logAnalytics } from "@/lib/analytics";
import { prisma } from "@/lib/db/prisma";
import { getTemplateById } from "@/lib/planning/activity-templates";
import {
  applyFeedbackToWeights,
  parsePairWeights,
} from "@/lib/planning/pair-weights";
import { getDefaultUserId } from "@/lib/user/default-user";

const FEEDBACK_TAGS = [
  "too loud",
  "too far",
  "too long",
  "great vibe",
  "good value",
  "good talk",
  "awkward timing",
] as const;

const TAG_SET = new Set<string>(FEEDBACK_TAGS);

export async function submitEventFeedback(formData: FormData) {
  const eventId = formData.get("eventId")?.toString() ?? "";
  const ratingKey = formData.get("rating")?.toString() ?? "";
  const userId = await getDefaultUserId();

  const event = await prisma.event.findFirst({
    where: { id: eventId, invite: { friend: { userId } } },
    include: { invite: true },
  });
  if (!event) redirect("/friends");

  const rating =
    ratingKey === "great" ? 2 : ratingKey === "ok" ? 1 : ratingKey === "no" ? 0 : -1;
  if (rating < 0) redirect(`/events/${eventId}?error=rating`);

  const tags = formData
    .getAll("tags")
    .filter((x): x is string => typeof x === "string" && TAG_SET.has(x));

  await prisma.feedback.create({
    data: {
      friendId: event.invite.friendId,
      eventId: event.id,
      rating,
      tags,
    },
  });

  const pm = await prisma.pairModel.findUnique({
    where: { friendId: event.invite.friendId },
  });
  const base = parsePairWeights(pm?.weights);
  const tpl = event.templateId ? getTemplateById(event.templateId) : undefined;
  const cat = tpl?.categories[0];
  const next = applyFeedbackToWeights(base, tags, cat);

  await prisma.pairModel.upsert({
    where: { friendId: event.invite.friendId },
    create: { friendId: event.invite.friendId, weights: next },
    update: { weights: next },
  });

  await logAnalytics("feedback_submitted", {
    eventId: event.id,
    friendId: event.invite.friendId,
  });

  revalidatePath(`/friends/${event.invite.friendId}`);
  revalidatePath(`/events/${eventId}`);
  redirect(`/friends/${event.invite.friendId}`);
}
