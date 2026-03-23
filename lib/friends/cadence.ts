export type CadenceKey = "weekly" | "biweekly" | "monthly";

const CADENCE_DAYS: Record<CadenceKey, number> = {
  weekly: 7,
  biweekly: 14,
  monthly: 30,
};

export function cadenceDaysFromKey(key: string | null | undefined): number | null {
  if (!key || !(key in CADENCE_DAYS)) return null;
  return CADENCE_DAYS[key as CadenceKey];
}

export function cadenceLabel(days: number): string {
  if (days <= 7) return "Weekly";
  if (days <= 14) return "Biweekly";
  return "Monthly";
}
