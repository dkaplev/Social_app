"use client";

import { useActionState } from "react";
import { createFriend } from "@/app/friends/actions";

export function NewFriendForm() {
  const [state, formAction, pending] = useActionState(createFriend, null);

  return (
    <form action={formAction} className="max-w-md space-y-5">
      {state?.error ? (
        <p
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-foreground">
          Name <span className="text-red-600 dark:text-red-400">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          placeholder="e.g. Sam"
          className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-foreground outline-none ring-offset-2 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-400 dark:border-zinc-600 dark:bg-zinc-950 dark:focus:border-zinc-500"
        />
      </div>

      <div>
        <span className="block text-sm font-medium text-foreground">
          Cadence <span className="text-red-600 dark:text-red-400">*</span>
        </span>
        <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-500">
          How often you aim to see this person.
        </p>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {(
            [
              ["weekly", "Weekly (~7 days)"],
              ["biweekly", "Biweekly (~14 days)"],
              ["monthly", "Monthly (~30 days)"],
            ] as const
          ).map(([value, label]) => (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm has-[:checked]:border-foreground has-[:checked]:bg-zinc-100 dark:border-zinc-700 dark:has-[:checked]:bg-zinc-800"
            >
              <input
                type="radio"
                name="cadence"
                value={value}
                defaultChecked={value === "biweekly"}
                className="text-foreground"
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label
          htmlFor="lastMetAt"
          className="block text-sm font-medium text-foreground"
        >
          Last met (optional)
        </label>
        <input
          id="lastMetAt"
          name="lastMetAt"
          type="date"
          className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-400 dark:border-zinc-600 dark:bg-zinc-950"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save friend"}
        </button>
      </div>
    </form>
  );
}
