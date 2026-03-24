import type { ActivityTemplate, SlotOption } from "@/lib/planning/types";

function nextWeekdayAt(
  from: Date,
  day: number,
  hour: number,
  minute: number,
): Date {
  for (let i = 0; i < 21; i++) {
    const d = new Date(from);
    d.setDate(from.getDate() + i);
    d.setHours(hour, minute, 0, 0);
    if (d.getDay() === day && d.getTime() > from.getTime()) return d;
  }
  const d = new Date(from);
  d.setDate(from.getDate() + 7);
  d.setHours(hour, minute, 0, 0);
  return d;
}

function jitterMinutes(d: Date, max: number): Date {
  const j = Math.floor((Math.random() - 0.5) * 2 * max);
  return new Date(d.getTime() + j * 60_000);
}

function fmt(d: Date): string {
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function slotsForTemplate(
  template: ActivityTemplate,
  opts: { weekdayEveningsOk: boolean | null },
  now: Date = new Date(),
): SlotOption[] {
  const weekdayOk = opts.weekdayEveningsOk !== false;

  const pickEvening = (): Date => {
    const wed = nextWeekdayAt(now, 3, 19, 0);
    const thu = nextWeekdayAt(now, 4, 19, 0);
    return jitterMinutes(wed < thu ? wed : thu, 12);
  };

  const pickSatAm = () => jitterMinutes(nextWeekdayAt(now, 6, 10, 30), 15);
  const pickSunPm = () => jitterMinutes(nextWeekdayAt(now, 0, 16, 0), 12);

  let a: Date;
  let b: Date;
  let c: Date;

  switch (template.slotStyle) {
    case "weekday_evening":
      if (weekdayOk) {
        a = pickEvening();
        b = pickSatAm();
        c = pickSunPm();
      } else {
        a = pickSatAm();
        b = jitterMinutes(nextWeekdayAt(now, 6, 14, 0), 20);
        c = pickSunPm();
      }
      break;
    case "weekend_morning":
      a = pickSatAm();
      b = weekdayOk ? pickEvening() : pickSunPm();
      c = pickSunPm();
      break;
    case "weekend_afternoon":
      a = pickSunPm();
      b = pickSatAm();
      c = weekdayOk
        ? pickEvening()
        : jitterMinutes(nextWeekdayAt(now, 6, 15, 0), 18);
      break;
    default:
      a = weekdayOk ? pickEvening() : pickSatAm();
      b = pickSatAm();
      c = pickSunPm();
  }

  const uniq = [a, b, c].sort((x, y) => x.getTime() - y.getTime());
  return uniq.map((d) => ({ iso: d.toISOString(), label: fmt(d) }));
}
