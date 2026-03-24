import Link from "next/link";
import { notFound } from "next/navigation";
import { MicroWeekdayForm } from "@/app/friends/[id]/plan/micro-weekday-form";
import { PlanSuggestionCards } from "@/app/friends/[id]/plan/plan-suggestion-cards";
import { logAnalytics } from "@/lib/analytics";
import { prisma } from "@/lib/db/prisma";
import { generatePlanSuggestions } from "@/lib/planning/generate-plans";
import { getDefaultUserId } from "@/lib/user/default-user";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

export default async function PlanPage({ params }: PageProps) {
  const { id } = await params;
  const userId = await getDefaultUserId();

  const friend = await prisma.friend.findFirst({
    where: { id, userId },
    include: { prefs: true, pairModel: true },
  });
  if (!friend) notFound();

  const { suggestions, needsWeekdayQuestion } = generatePlanSuggestions({
    name: friend.name,
    prefs: friend.prefs,
    pairWeightsJson: friend.pairModel?.weights,
  });

  if (!needsWeekdayQuestion) {
    await logAnalytics("plan_generated", { friendId: friend.id });
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6">
      <div>
        <Link
          href={`/friends/${friend.id}`}
          className="text-sm font-medium text-zinc-600 underline-offset-4 hover:text-foreground hover:underline dark:text-zinc-400"
        >
          ← {friend.name}
        </Link>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
          Plan with {friend.name}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
          Three ideas ranked to your preferences. Create an invite to send a
          voting link — no app required for them.
        </p>
      </div>

      {needsWeekdayQuestion ? (
        <MicroWeekdayForm friendId={friend.id} />
      ) : (
        <PlanSuggestionCards friendId={friend.id} suggestions={suggestions} />
      )}
    </main>
  );
}
