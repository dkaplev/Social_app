import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { getDefaultUserId } from "@/lib/user/default-user";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

export default async function PlanStubPage({ params }: PageProps) {
  const { id } = await params;
  const userId = await getDefaultUserId();
  const friend = await prisma.friend.findFirst({
    where: { id, userId },
    select: { id: true, name: true },
  });
  if (!friend) notFound();

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6">
      <Link
        href={`/friends/${friend.id}`}
        className="text-sm font-medium text-zinc-600 underline-offset-4 hover:text-foreground hover:underline dark:text-zinc-400"
      >
        ← {friend.name}
      </Link>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Plan with {friend.name}
        </h1>
        <p className="mt-2 max-w-xl text-sm text-zinc-600 dark:text-zinc-400">
          Rule-based plan suggestions (three options, time windows) ship in Day
          7. For now, confirm cadence and preferences on their profile.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link
          href={`/friends/${friend.id}`}
          className="inline-flex rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-foreground hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-900"
        >
          Edit preferences
        </Link>
        <Link
          href="/"
          className="inline-flex rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
        >
          Dashboard
        </Link>
      </div>
    </main>
  );
}
