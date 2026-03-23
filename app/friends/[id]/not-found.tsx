import Link from "next/link";

export default function FriendNotFound() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center gap-4 px-4 py-20 text-center sm:px-6">
      <h1 className="text-xl font-semibold text-foreground">Friend not found</h1>
      <p className="max-w-sm text-sm text-zinc-600 dark:text-zinc-400">
        That person isn’t in your list, or the link is wrong.
      </p>
      <Link
        href="/friends"
        className="text-sm font-medium text-foreground underline underline-offset-4"
      >
        Back to friends
      </Link>
    </main>
  );
}
