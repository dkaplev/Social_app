import Link from "next/link";

const nav = [
  { href: "/", label: "Dashboard" },
  { href: "/friends", label: "Friends" },
  { href: "/friends/new", label: "Add friend" },
] as const;

export function AppHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 dark:border-zinc-800/80">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="text-base font-semibold tracking-tight text-foreground"
        >
          Warm
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2" aria-label="Main">
          {nav.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="rounded-md px-2.5 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-foreground dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
