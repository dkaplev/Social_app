"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { cadenceDaysFromKey } from "@/lib/friends/cadence";
import { getDefaultUserId } from "@/lib/user/default-user";

export type CreateFriendState = { error?: string } | null;

export async function createFriend(
  _prev: CreateFriendState,
  formData: FormData,
): Promise<CreateFriendState> {
  const name = formData.get("name")?.toString().trim() ?? "";
  if (!name) {
    return { error: "Name is required." };
  }

  const cadenceKey = formData.get("cadence")?.toString();
  const cadenceDays = cadenceDaysFromKey(cadenceKey);
  if (cadenceDays == null) {
    return { error: "Choose how often you want to meet." };
  }

  const lastMetRaw = formData.get("lastMetAt")?.toString().trim();
  let lastMetAt: Date | undefined;
  if (lastMetRaw) {
    const d = new Date(lastMetRaw + "T12:00:00");
    if (Number.isNaN(d.getTime())) {
      return { error: "Last met date is invalid." };
    }
    lastMetAt = d;
  }

  const userId = await getDefaultUserId();

  await prisma.friend.create({
    data: {
      userId,
      name,
      cadenceDays,
      lastMetAt: lastMetAt ?? null,
      prefs: {
        create: {},
      },
    },
  });

  revalidatePath("/friends");
  redirect("/friends");
}
