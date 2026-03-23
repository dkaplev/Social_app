export const DURATION_BANDS = ["45m", "90m", "2-3h"] as const;
export type DurationBand = (typeof DURATION_BANDS)[number];

export const TRAVEL_MINUTES = [10, 20, 30, 45] as const;

export const BUDGET_BANDS = ["low", "mid", "high"] as const;
export type BudgetBand = (typeof BUDGET_BANDS)[number];

export const CATEGORY_OPTIONS = [
  "coffee",
  "walk",
  "lunch",
  "dinner",
  "sport",
  "culture",
  "cowork",
] as const;

export const AVOID_TAG_OPTIONS = [
  "loud",
  "far",
  "expensive",
  "late_night",
  "big_groups",
  "early_morning",
] as const;

export function isStringArrayJson(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((x) => typeof x === "string");
}

export function parseStringArray(value: unknown): string[] {
  if (!isStringArrayJson(value)) return [];
  return value;
}
