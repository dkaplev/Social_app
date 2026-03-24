import { submitDemoSeed } from "@/app/actions/demo-seed";

export function DemoSeedForm() {
  if (process.env.NODE_ENV !== "development") return null;

  return (
    <form
      action={submitDemoSeed}
      className="mx-auto mt-2 w-full max-w-5xl px-4 sm:px-6"
    >
      <button
        type="submit"
        className="text-xs text-zinc-500 underline hover:text-foreground"
      >
        Load demo data (dev)
      </button>
    </form>
  );
}
