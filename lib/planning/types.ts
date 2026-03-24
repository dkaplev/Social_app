export type SlotOption = { iso: string; label: string };

export type PlanSuggestion = {
  title: string;
  templateId: string;
  proposedStartTimes: SlotOption[];
  durationMinutes: number;
  locationType: string;
  whyLine: string;
};

export type ActivityTemplate = {
  id: string;
  title: string;
  vibeTarget: number;
  budget: "low" | "mid" | "high";
  durationBand: "45m" | "90m" | "2-3h";
  durationMinutes: number;
  indoorOutdoor: "indoor" | "outdoor" | "mixed";
  goodFor: string[];
  categories: string[];
  /** Used for slot picking + micro-question filtering */
  slotStyle: "weekday_evening" | "weekend_morning" | "weekend_afternoon" | "flex";
  locationBlurb: string;
};
