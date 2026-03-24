import type { PlanSuggestion } from "@/lib/planning/types";

export function inviteMessageFriendly(
  friendName: string,
  inviteUrl: string,
  suggestion: Pick<PlanSuggestion, "title" | "proposedStartTimes">,
): string {
  const times = suggestion.proposedStartTimes.map((s) => s.label).join(" · ");
  return `Hey! Want to hang — ${suggestion.title} with ${friendName}? Pick a time that works: ${times}. Vote here: ${inviteUrl}`;
}

export function inviteMessageShort(
  friendName: string,
  inviteUrl: string,
  suggestion: Pick<PlanSuggestion, "title">,
): string {
  return `${friendName} · ${suggestion.title} — pick a slot: ${inviteUrl}`;
}

export function inviteMessageDirect(inviteUrl: string): string {
  return `Pick a time: ${inviteUrl}`;
}
