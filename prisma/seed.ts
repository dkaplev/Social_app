import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.feedback.deleteMany();
  await prisma.event.deleteMany();
  await prisma.invite.deleteMany();
  await prisma.pairModel.deleteMany();
  await prisma.friendPrefs.deleteMany();
  await prisma.friend.deleteMany();
  await prisma.user.deleteMany();

  const user = await prisma.user.create({
    data: {
      email: "demo@local.test",
      friends: {
        create: [
          {
            name: "Alex",
            cadenceDays: 14,
            temperature: "COOLING",
            prefs: {
              create: {
                vibeQuietLively: 40,
                maxTravelMinutes: 20,
                budgetBand: "mid",
                durationBand: "90m",
                categories: ["coffee", "walk"],
              },
            },
            pairModel: {
              create: {
                weights: {
                  vibePreference: 40,
                  travelPreference: 20,
                  budgetPreference: "mid",
                  durationPreference: "90m",
                  categoryBoosts: {},
                },
              },
            },
          },
        ],
      },
    },
    include: { friends: { include: { prefs: true } } },
  });

  console.log("Seed OK:", { userId: user.id, friends: user.friends.length });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
