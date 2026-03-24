import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDebugPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const rows = await prisma.analyticsEvent.groupBy({
    by: ["name"],
    _count: { id: true },
    orderBy: { name: "asc" },
  });

  return (
    <main className="mx-auto max-w-lg px-4 py-10">
      <Link href="/" className="text-sm text-zinc-600 hover:underline">
        ← Home
      </Link>
      <h1 className="mt-4 text-xl font-semibold">Analytics (dev)</h1>
      <p className="mt-2 text-xs text-zinc-500">
        Funnel counts from server logs. Production builds hide this route.
      </p>
      <ul className="mt-6 space-y-2 font-mono text-sm">
        {rows.map((r) => (
          <li key={r.name} className="flex justify-between gap-4">
            <span>{r.name}</span>
            <span>{r._count.id}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
