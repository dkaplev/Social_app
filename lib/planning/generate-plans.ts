import { ACTIVITY_TEMPLATES } from "@/lib/planning/activity-templates";
import type { ActivityTemplate } from "@/lib/planning/types";
import type { PlanSuggestion } from "@/lib/planning/types";
import { parsePairWeights, type PairWeights } from "@/lib/planning/pair-weights";
import { slotsForTemplate } from "@/lib/planning/time-slots";
import { parseStringArray } from "@/lib/friends/pref-options";

export type FriendForPlanning = {
  name: string;
  prefs: {
    vibeQuietLively: number;
    maxTravelMinutes: number;
    budgetBand: string;
    durationBand: string;
    categories: unknown;
    avoidTags: unknown;
    weekdayEveningsOk: boolean | null;
  } | null;
  pairWeightsJson: unknown;
};

function budgetRank(b: string): number {
  return b === "low" ? 0 : b === "mid" ? 1 : 2;
}

function durationRank(b: string): number {
  if (b === "45m") return 0;
  if (b === "90m") return 1;
  return 2;
}

function templateAllowed(
  t: ActivityTemplate,
  friendCats: string[],
  avoid: string[],
): boolean {
  if (avoid.includes("loud") && t.vibeTarget >= 70) return false;
  if (avoid.includes("expensive") && t.budget === "high") return false;
  if (avoid.includes("big_groups") && t.goodFor.includes("active")) return false;
  if (friendCats.length > 0) {
    const overlap = t.categories.some((c) => friendCats.includes(c));
    if (!overlap) return false;
  }
  return true;
}

function scoreTemplate(
  t: ActivityTemplate,
  vibe: number,
  budget: string,
  durationBand: string,
  pair: PairWeights,
): number {
  let s = 100 - Math.abs(vibe - t.vibeTarget) * 0.35;
  if (t.budget === budget) s += 12;
  else if (Math.abs(budgetRank(t.budget) - budgetRank(budget)) === 1) s += 5;
  if (t.durationBand === durationBand) s += 12;
  else if (Math.abs(durationRank(t.durationBand) - durationRank(durationBand)) === 1)
    s += 4;
  s -= Math.abs(vibe - pair.vibePreference) * 0.08;
  for (const c of t.categories) {
    s += (pair.categoryBoosts[c] ?? 0) * 2;
  }
  if (pair.durationPreference === t.durationBand) s += 6;
  if (pair.budgetPreference === t.budget) s += 4;
  return s;
}

export type GenerateResult = {
  suggestions: PlanSuggestion[];
  confidenceLow: boolean;
  needsWeekdayQuestion: boolean;
};

export function generatePlanSuggestions(
  friend: FriendForPlanning,
  now: Date = new Date(),
): GenerateResult {
  const p = friend.prefs;
  const vibe = p?.vibeQuietLively ?? 50;
  const budget = p?.budgetBand ?? "mid";
  const durationBand = p?.durationBand ?? "90m";
  const friendCats = parseStringArray(p?.categories);
  const avoid = parseStringArray(p?.avoidTags);
  const weekdayEveningsOk = p?.weekdayEveningsOk ?? null;
  const pair = parsePairWeights(friend.pairWeightsJson);

  const candidates = ACTIVITY_TEMPLATES.filter((t) =>
    templateAllowed(t, friendCats, avoid),
  );

  const scored = candidates.map((t) => ({
    t,
    score: scoreTemplate(t, vibe, budget, durationBand, pair),
  }));

  scored.sort((a, b) => b.score - a.score);

  const top = scored.slice(0, 8);
  const picked: ActivityTemplate[] = [];
  for (const row of top) {
    if (picked.length >= 3) break;
    if (!picked.some((x) => x.id === row.t.id)) picked.push(row.t);
  }

  if (picked.length < 3) {
    for (const t of ACTIVITY_TEMPLATES) {
      if (picked.length >= 3) break;
      if (!picked.some((x) => x.id === t.id)) picked.push(t);
    }
  }

  const suggestions: PlanSuggestion[] = picked.slice(0, 3).map((t) => ({
    title: t.title,
    templateId: t.id,
    proposedStartTimes: slotsForTemplate(t, { weekdayEveningsOk }, now),
    durationMinutes: t.durationMinutes,
    locationType: t.indoorOutdoor,
    whyLine: whyLine(t, friend.name, vibe, budget),
  }));

  const topScores = scored.slice(0, 3).map((x) => x.score);
  const confidenceLow =
    topScores.length >= 3 &&
    topScores[0] - topScores[2] < 10 &&
    (friendCats.length === 0 || topScores[0] < 72);

  const needsWeekdayQuestion = confidenceLow && weekdayEveningsOk === null;

  return { suggestions, confidenceLow, needsWeekdayQuestion };
}

function whyLine(
  t: ActivityTemplate,
  name: string,
  vibe: number,
  budget: string,
): string {
  const bits: string[] = [];
  if (Math.abs(vibe - t.vibeTarget) < 18) bits.push("matches your vibe");
  if (t.budget === budget) bits.push("fits the budget");
  if (bits.length === 0) bits.push("a solid default to propose");
  return `For ${name}: ${bits.join(" · ")}.`;
}
