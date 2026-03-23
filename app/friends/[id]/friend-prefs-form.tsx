"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { updateFriendPrefs } from "@/app/friends/[id]/actions";
import {
  AVOID_TAG_OPTIONS,
  BUDGET_BANDS,
  CATEGORY_OPTIONS,
  DURATION_BANDS,
  TRAVEL_MINUTES,
} from "@/lib/friends/pref-options";

type Props = {
  friendId: string;
  initial: {
    durationBand: string;
    maxTravelMinutes: number;
    budgetBand: string;
    vibeQuietLively: number;
    categories: string[];
    avoidTags: string[];
  };
};

const durationLabels: Record<string, string> = {
  "45m": "45 minutes",
  "90m": "90 minutes",
  "2-3h": "2–3 hours",
};

const budgetLabels: Record<string, string> = {
  low: "Low",
  mid: "Mid",
  high: "High",
};

const avoidLabels: Record<string, string> = {
  loud: "Loud venues",
  far: "Long travel",
  expensive: "Pricey spots",
  late_night: "Late nights",
  big_groups: "Big groups",
  early_morning: "Early mornings",
};

function capitalize(s: string) {
  return s.slice(0, 1).toUpperCase() + s.slice(1);
}

export function FriendPrefsForm({ friendId, initial }: Props) {
  const [vibe, setVibe] = useState(initial.vibeQuietLively);
  const bound = updateFriendPrefs.bind(null, friendId);
  const [state, formAction, pending] = useActionState(bound, null);
  const prevOk = useRef(false);

  useEffect(() => {
    if (state?.ok && !prevOk.current) {
      prevOk.current = true;
      const t = window.setTimeout(() => {
        prevOk.current = false;
      }, 2500);
      return () => window.clearTimeout(t);
    }
    if (!state?.ok) prevOk.current = false;
  }, [state?.ok]);

  return (
    <form action={formAction} className="space-y-8">
      {state?.error ? (
        <p
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}
      {state?.ok ? (
        <p
          className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200"
          role="status"
        >
          Preferences saved.
        </p>
      ) : null}

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-foreground">Duration</legend>
        <div className="flex flex-wrap gap-2">
          {DURATION_BANDS.map((v) => (
            <label
              key={v}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm has-[:checked]:border-foreground has-[:checked]:bg-zinc-100 dark:border-zinc-700 dark:has-[:checked]:bg-zinc-800"
            >
              <input
                type="radio"
                name="durationBand"
                value={v}
                defaultChecked={initial.durationBand === v}
              />
              {durationLabels[v] ?? v}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <div className="flex items-baseline justify-between gap-4">
          <label
            htmlFor="vibeQuietLively"
            className="text-sm font-medium text-foreground"
          >
            Vibe: quiet ↔ lively
          </label>
          <span className="font-mono text-sm text-zinc-600 dark:text-zinc-400">
            {vibe}
          </span>
        </div>
        <input
          id="vibeQuietLively"
          name="vibeQuietLively"
          type="range"
          min={0}
          max={100}
          value={vibe}
          onChange={(e) => setVibe(Number(e.target.value))}
          className="mt-2 w-full accent-foreground"
        />
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-foreground">
          Max travel (minutes)
        </legend>
        <div className="flex flex-wrap gap-2">
          {TRAVEL_MINUTES.map((m) => (
            <label
              key={m}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm has-[:checked]:border-foreground has-[:checked]:bg-zinc-100 dark:border-zinc-700 dark:has-[:checked]:bg-zinc-800"
            >
              <input
                type="radio"
                name="maxTravelMinutes"
                value={m}
                defaultChecked={initial.maxTravelMinutes === m}
              />
              {m} min
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-foreground">Budget</legend>
        <div className="flex flex-wrap gap-2">
          {BUDGET_BANDS.map((b) => (
            <label
              key={b}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm capitalize has-[:checked]:border-foreground has-[:checked]:bg-zinc-100 dark:border-zinc-700 dark:has-[:checked]:bg-zinc-800"
            >
              <input
                type="radio"
                name="budgetBand"
                value={b}
                defaultChecked={initial.budgetBand === b}
              />
              {budgetLabels[b]}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-foreground">
          Categories
        </legend>
        <p className="text-xs text-zinc-500 dark:text-zinc-500">
          What kinds of hangs fit well.
        </p>
        <div className="mt-1 flex flex-wrap gap-2">
          {CATEGORY_OPTIONS.map((c) => (
            <label
              key={c}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm has-[:checked]:border-foreground has-[:checked]:bg-zinc-100 dark:border-zinc-700 dark:has-[:checked]:bg-zinc-800"
            >
              <input
                type="checkbox"
                name="categories"
                value={c}
                defaultChecked={initial.categories.includes(c)}
              />
              {capitalize(c)}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-foreground">
          Avoid (optional)
        </legend>
        <p className="text-xs text-zinc-500 dark:text-zinc-500">
          Soft constraints for planning.
        </p>
        <div className="mt-1 flex flex-wrap gap-2">
          {AVOID_TAG_OPTIONS.map((t) => (
            <label
              key={t}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm has-[:checked]:border-foreground has-[:checked]:bg-zinc-100 dark:border-zinc-700 dark:has-[:checked]:bg-zinc-800"
            >
              <input
                type="checkbox"
                name="avoidTags"
                value={t}
                defaultChecked={initial.avoidTags.includes(t)}
              />
              {avoidLabels[t] ?? t}
            </label>
          ))}
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save preferences"}
      </button>
    </form>
  );
}
