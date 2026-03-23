import packageJson from "../package.json";

export function DebugStatus() {
  const env = process.env.NODE_ENV ?? "unknown";
  const version = packageJson.version ?? "0.0.0";

  return (
    <aside
      className="mx-auto mt-auto w-full max-w-5xl border-t border-dashed border-zinc-200 px-4 py-3 dark:border-zinc-800 sm:px-6"
      aria-label="Debug status"
    >
      <p className="font-mono text-xs text-zinc-500 dark:text-zinc-500">
        <span className="text-zinc-400 dark:text-zinc-600">env</span>{" "}
        <span className="text-zinc-700 dark:text-zinc-300">{env}</span>
        <span className="mx-2 text-zinc-300 dark:text-zinc-700">·</span>
        <span className="text-zinc-400 dark:text-zinc-600">build</span>{" "}
        <span className="text-zinc-700 dark:text-zinc-300">v{version}</span>
      </p>
    </aside>
  );
}
