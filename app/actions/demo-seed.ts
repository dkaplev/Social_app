"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { createInviteToken } from "@/lib/invite/token";
import { DEFAULT_PAIR_WEIGHTS } from "@/lib/planning/pair-weights";
import { getDefaultUserId } from "@/lib/user/default-user";

export async function submitDemoSeed() {
  if (process.env.NODE_ENV === "production") return;
  await loadDemoData();
}

export async function loadDemoData() {
  if (process.env.NODE_ENV === "production") {
    return { ok: false as const, error: "Only in development." };
  }

  const userId = await getDefaultUserId();

  await prisma.feedback.deleteMany();
  await prisma.event.deleteMany();
  await prisma.invite.deleteMany();
  await prisma.pairModel.deleteMany();
  await prisma.friendPrefs.deleteMany();
  await prisma.friend.deleteMany({ where: { userId } });

  const names = [
    "Maya",
    "Jordan",
    "Sam",
    "Riley",
    "Casey",
    "Alex",
    "Taylor",
    "Quinn",
    "Avery",
    "Drew",
  ];

  const now = new Date();
  const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000);

  for (let i = 0; i < names.length; i++) {
    await prisma.friend.create({
      data: {
        userId,
        name: names[i]!,
        cadenceDays: [7, 14, 14, 30, 7, 14, 30, 14, 7, 30][i] ?? 14,
        lastMetAt: daysAgo([3, 8, 20, 40, 1, 12, 5, 25, 2, 45][i] ?? 10),
        prefs: {
          create: {
            vibeQuietLively: 35 + (i % 5) * 10,
            categories: [
              ["coffee"],
              ["walk", "coffee"],
              ["lunch"],
              ["dinner"],
              ["culture"],
            ][i % 5]!,
          },
        },
        pairModel: {
          create: { weights: DEFAULT_PAIR_WEIGHTS },
        },
      },
    });
  }

  const two = await prisma.friend.findMany({
    where: { userId },
    take: 2,
    orderBy: { createdAt: "asc" },
  });
  const f0 = two[0];
  const f1 = two[1];
  if (f0 && f1) {
    const t0 = createInviteToken();
    const t1 = createInviteToken();
    const exp = new Date();
    exp.setDate(exp.getDate() + 14);
    const slots = [
      { iso: new Date(now.getTime() + 86400000 * 2).toISOString(), label: "Soon A" },
      { iso: new Date(now.getTime() + 86400000 * 3).toISOString(), label: "Soon B" },
      { iso: new Date(now.getTime() + 86400000 * 5).toISOString(), label: "Soon C" },
    ];
    const inv0 = await prisma.invite.create({
      data: {
        friendId: f0.id,
        token: t0,
        proposedSlots: slots,
        durationMinutes: 90,
        templateId: "coffee_chat",
        status: "ACCEPTED",
        chosenSlot: { iso: slots[0]!.iso, label: slots[0]!.label },
        expiresAt: exp,
      },
    });
    await prisma.event.create({
      data: {
        inviteId: inv0.id,
        startsAt: new Date(slots[0]!.iso),
        endsAt: new Date(new Date(slots[0]!.iso).getTime() + 90 * 60_000),
        title: `Meetup with ${f0.name}`,
        locationText: "Quiet café with seating",
        templateId: "coffee_chat",
      },
    });

    const inv1 = await prisma.invite.create({
      data: {
        friendId: f1.id,
        token: t1,
        proposedSlots: slots,
        durationMinutes: 60,
        templateId: "walk_coffee",
        status: "ACCEPTED",
        chosenSlot: { iso: slots[1]!.iso, label: slots[1]!.label },
        expiresAt: exp,
      },
    });
    const pastStart = daysAgo(4);
    const ev1 = await prisma.event.create({
      data: {
        inviteId: inv1.id,
        startsAt: pastStart,
        endsAt: new Date(pastStart.getTime() + 60 * 60_000),
        title: `Meetup with ${f1.name}`,
        locationText: "Park loop ending near coffee",
        templateId: "walk_coffee",
      },
    });

    await prisma.feedback.create({
      data: {
        friendId: f1.id,
        eventId: ev1.id,
        rating: 2,
        tags: ["great vibe", "good talk"],
      },
    });
  }

  revalidatePath("/");
  revalidatePath("/friends");
  revalidatePath("/graph");
  return { ok: true as const };
}
