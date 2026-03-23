import type { FriendTemperature } from "@prisma/client";

export type TemperatureInputs = {
  lastMetAt: Date | null;
  createdAt: Date;
  cadenceDays: number;
};

/** Local calendar day start (midnight) for day-diff semantics. */
function localDayStartMs(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/** Whole calendar days from `from` (anchor day) to `to`, using local dates. */
export function wholeCalendarDaysBetween(from: Date, to: Date): number {
  const a = localDayStartMs(from);
  const b = localDayStartMs(to);
  return Math.max(0, Math.floor((b - a) / 86_400_000));
}

/**
 * Warm: days since last meet &lt; 0.75 × cadence (or new friend, no meet yet, within first cadence window).
 * Cooling: [0.75, 1.25) × cadence since last meet.
 * Cold: ≥ 1.25 × cadence since last meet, or never met and friend added longer than one cadence ago.
 */
export function computeFriendTemperature(
  friend: TemperatureInputs,
  now: Date = new Date(),
): FriendTemperature {
  const cadence = Math.max(1, friend.cadenceDays);

  if (friend.lastMetAt) {
    const daysSince = wholeCalendarDaysBetween(friend.lastMetAt, now);
    const warmUntil = 0.75 * cadence;
    const coolUntil = 1.25 * cadence;
    if (daysSince < warmUntil) return "WARM";
    if (daysSince < coolUntil) return "COOLING";
    return "COLD";
  }

  const daysSinceCreated = wholeCalendarDaysBetween(friend.createdAt, now);
  if (daysSinceCreated > cadence) return "COLD";
  return "WARM";
}

/** Sort coldest first, then by name. */
export function temperatureSortKey(t: FriendTemperature): number {
  switch (t) {
    case "COLD":
      return 0;
    case "COOLING":
      return 1;
    default:
      return 2;
  }
}
