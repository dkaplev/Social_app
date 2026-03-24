import { weekdayAnswer } from "@/app/friends/[id]/plan/actions";

export function MicroWeekdayForm({ friendId }: { friendId: string }) {
  return (
    <div className="max-w-lg rounded-xl border border-amber-200 bg-amber-50/80 p-6 dark:border-amber-900/40 dark:bg-amber-950/30">
      <h2 className="text-lg font-semibold text-foreground">
        Quick check-in
      </h2>
      <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
        We’re not sure weekday evenings work for you two yet. Are weekday
        evenings generally okay?
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <form action={weekdayAnswer}>
          <input type="hidden" name="friendId" value={friendId} />
          <input type="hidden" name="answer" value="yes" />
          <button
            type="submit"
            className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background"
          >
            Yes
          </button>
        </form>
        <form action={weekdayAnswer}>
          <input type="hidden" name="friendId" value={friendId} />
          <input type="hidden" name="answer" value="no" />
          <button
            type="submit"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-600"
          >
            No
          </button>
        </form>
        <form action={weekdayAnswer}>
          <input type="hidden" name="friendId" value={friendId} />
          <input type="hidden" name="answer" value="skip" />
          <button
            type="submit"
            title="We’ll lean on weekend-friendly slots"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-600"
          >
            Skip (weekend-leaning)
          </button>
        </form>
      </div>
    </div>
  );
}
