import Link from "next/link";
import { NewFriendForm } from "./new-friend-form";

export const dynamic = "force-dynamic";

export default function NewFriendPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6">
      <div>
        <Link
          href="/friends"
          className="text-sm font-medium text-zinc-600 underline-offset-4 hover:text-foreground hover:underline dark:text-zinc-400"
        >
          ← Friends
        </Link>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
          Add friend
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Name and cadence are saved; you can tune planning preferences on their
          profile next.
        </p>
      </div>
      <div className="max-w-md rounded-xl border border-zinc-200 bg-zinc-50/50 p-6 dark:border-zinc-800 dark:bg-zinc-900/30">
        <NewFriendForm />
      </div>
    </main>
  );
}
