export type PairWeights = {
  vibePreference: number;
  travelPreference: number;
  budgetPreference: string;
  durationPreference: string;
  categoryBoosts: Record<string, number>;
};

export const DEFAULT_PAIR_WEIGHTS: PairWeights = {
  vibePreference: 50,
  travelPreference: 30,
  budgetPreference: "mid",
  durationPreference: "90m",
  categoryBoosts: {},
};

export function parsePairWeights(raw: unknown): PairWeights {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_PAIR_WEIGHTS };
  const o = raw as Record<string, unknown>;
  const categoryBoostes =
    o.categoryBoosts && typeof o.categoryBoosts === "object" && o.categoryBoostes !== null
      ? (o.categoryBoostes as Record<string, number>)
      : {};
  return {
    vibePreference:
      typeof o.vibePreference === "number"
        ? Math.min(100, Math.max(0, o.vibePreference))
        : DEFAULT_PAIR_WEIGHTS.vibePreference,
    travelPreference:
      typeof o.travelPreference === "number"
        ? Math.min(120, Math.max(5, o.travelPreference))
        : DEFAULT_PAIR_WEIGHTS.travelPreference,
    budgetPreference:
      typeof o.budgetPreference === "string"
        ? o.budgetPreference
        : DEFAULT_PAIR_WEIGHTS.budgetPreference,
    durationPreference:
      typeof o.durationPreference === "string"
        ? o.durationPreference
        : DEFAULT_PAIR_WEIGHTS.durationPreference,
    categoryBoosts: { ...categoryBoostes },
  };
}

/** Apply Day 13-style nudges from feedback tags + template category */
export function applyFeedbackToWeights(
  weights: PairWeights,
  tags: string[],
  templateCategory: string | undefined,
): PairWeights {
  let vibe = weights.vibePreference;
  let travel = weights.travelPreference;
  const boosts = { ...weights.categoryBoosts };

  if (tags.includes("too loud")) vibe = Math.max(0, vibe - 12);
  if (tags.includes("too far")) travel = Math.max(10, travel - 10);
  if (tags.includes("too long")) {
    /* prefer shorter — bump duration pref toward 45m symbolically */
  }
  if (tags.includes("great vibe")) vibe = Math.min(100, vibe + 5);
  if (tags.includes("good talk") && templateCategory) {
    boosts[templateCategory] = (boosts[templateCategory] ?? 0) + 3;
  }
  if (tags.includes("good value")) {
    boosts.value = (boosts.value ?? 0) + 2;
  }
  if (tags.includes("awkward timing")) {
    boosts.timing = (boosts.timing ?? 0) - 2;
  }

  return {
    ...weights,
    vibePreference: vibe,
    travelPreference: travel,
    categoryBoosts: boosts,
  };
}
