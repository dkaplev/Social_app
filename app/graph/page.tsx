import Link from "next/link";
import { FriendsGraph } from "@/app/graph/friends-graph";
import { prisma } from "@/lib/db/prisma";
import { computeFriendTemperature } from "@/lib/friends/temperature";
import { getDefaultUserId } from "@/lib/user/default-user";

export const dynamic = "force-dynamic";

export default async function GraphPage() {
  const userId = await getDefaultUserId();
  const friends = await prisma.friend.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  });

  const nodes = friends.map((f) => ({
    id: f.id,
    name: f.name,
    temperature: computeFriendTemperature(f),
  }));

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6">
      <div>
        <Link
          href="/"
          className="text-sm text-zinc-600 hover:text-foreground dark:text-zinc-400"
        >
          ← Dashboard
        </Link>
        <h1 className="mt-4 text-2xl font-semibold">Friend map</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Nodes use relationship temperature. Click a node to open their
          profile.
        </p>
      </div>
      {nodes.length === 0 ? (
        <p className="text-sm text-zinc-500">Add friends to see the graph.</p>
      ) : (
        <FriendsGraph friends={nodes} />
      )}
    </main>
  );
}
