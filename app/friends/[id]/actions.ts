"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import {
  AVOID_TAG_OPTIONS,
  BUDGET_BANDS,
  CATEGORY_OPTIONS,
  DURATION_BANDS,
  TRAVEL_MINUTES,
} from "@/lib/friends/pref-options";
import { getDefaultUserId } from "@/lib/user/default-user";

export type UpdatePrefsState = { ok?: boolean; error?: string } | null;

function allowedMulti(
  values: FormDataEntryValue[],
  allowed: readonly string[],
): string[] {
  const set = new Set(allowed);
  return values
    .map((v) => (typeof v === "string" ? v : ""))
    .filter((v) => set.has(v));
}

export async function updateFriendPrefs(
  friendId: string,
  _prev: UpdatePrefsState,
  formData: FormData,
): Promise<UpdatePrefsState> {
  const userId = await getDefaultUserId();
  const friend = await prisma.friend.findFirst({
    where: { id: friendId, userId },
  });
  if (!friend) {
    return { error: "Friend not found." };
  }

  const durationBand = formData.get("durationBand")?.toString() ?? "";
  if (!(DURATION_BANDS as readonly string[]).includes(durationBand)) {
    return { error: "Pick a duration band." };
  }

  const travelRaw = formData.get("maxTravelMinutes")?.toString();
  const maxTravelMinutes = Number(travelRaw);
  if (!TRAVEL_MINUTES.includes(maxTravelMinutes as (typeof TRAVEL_MINUTES)[number])) {
    return { error: "Pick a travel time." };
  }

  const budgetBand = formData.get("budgetBand")?.toString() ?? "";
  if (!(BUDGET_BANDS as readonly string[]).includes(budgetBand)) {
    return { error: "Pick a budget band." };
  }

  const vibeRaw = formData.get("vibeQuietLively")?.toString();
  const vibeQuietLively = Math.min(
    100,
    Math.max(0, Number.parseInt(vibeRaw ?? "", 10) || 0),
  );

  const categories = allowedMulti(
    formData.getAll("categories"),
    CATEGORY_OPTIONS,
  );
  const avoidTags = allowedMulti(
    formData.getAll("avoidTags"),
    AVOID_TAG_OPTIONS,
  );

  await prisma.friendPrefs.upsert({
    where: { friendId },
    create: {
      friendId,
      durationBand,
      maxTravelMinutes,
      budgetBand,
      vibeQuietLively,
      categories,
      avoidTags,
    },
    update: {
      durationBand,
      maxTravelMinutes,
      budgetBand,
      vibeQuietLively,
      categories,
      avoidTags,
    },
  });

  revalidatePath(`/friends/${friendId}`);
  revalidatePath("/friends");
  return { ok: true };
}
