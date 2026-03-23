export function temperatureStyles(t: string) {
  switch (t) {
    case "WARM":
      return "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200";
    case "COOLING":
      return "bg-amber-100 text-amber-950 dark:bg-amber-950/40 dark:text-amber-100";
    default:
      return "bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200";
  }
}

export function temperatureLabel(t: string) {
  switch (t) {
    case "WARM":
      return "Warm";
    case "COOLING":
      return "Cooling";
    default:
      return "Cold";
  }
}
