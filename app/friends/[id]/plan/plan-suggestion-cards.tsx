import { createInviteFromPlan } from "@/app/friends/[id]/plan/actions";
import type { PlanSuggestion } from "@/lib/planning/types";

export function PlanSuggestionCards({
  friendId,
  suggestions,
}: {
  friendId: string;
  suggestions: PlanSuggestion[];
}) {
  return (
    <ul className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
      {suggestions.map((s) => (
        <li
          key={s.templateId}
          className="flex flex-col rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950/40"
        >
          <h3 className="text-lg font-semibold text-foreground">{s.title}</h3>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            {s.whyLine}
          </p>
          <p className="mt-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
            Times to propose
          </p>
          <ul className="mt-1 space-y-1 text-sm text-foreground">
            {s.proposedStartTimes.map((t) => (
              <li key={t.iso}>{t.label}</li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-zinc-500">
            ~{s.durationMinutes} min · {s.locationType}
          </p>
          <form action={createInviteFromPlan} className="mt-4 flex flex-1 flex-col gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
            <input type="hidden" name="friendId" value={friendId} />
            <input type="hidden" name="templateId" value={s.templateId} />
            <input type="hidden" name="durationMinutes" value={s.durationMinutes} />
            <input
              type="hidden"
              name="slotsJson"
              value={JSON.stringify(s.proposedStartTimes)}
            />
            <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
              <input type="checkbox" name="recurring" className="rounded" />
              Save as a ritual template (no auto-repeat yet)
            </label>
            <button
              type="submit"
              className="mt-auto w-full rounded-lg bg-foreground py-2 text-sm font-medium text-background hover:opacity-90"
            >
              Create invite
            </button>
          </form>
        </li>
      ))}
    </ul>
  );
}
