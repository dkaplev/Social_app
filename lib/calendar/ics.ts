function icsEscape(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}

function foldLine(line: string): string {
  if (line.length <= 75) return line;
  let out = "";
  let rest = line;
  while (rest.length > 75) {
    out += rest.slice(0, 75) + "\r\n ";
    rest = rest.slice(75);
  }
  return out + rest;
}

function toIcsUtc(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

export function buildEventIcs(opts: {
  uid: string;
  start: Date;
  end: Date;
  summary: string;
  description?: string;
  location?: string;
}): string {
  const dtStamp = toIcsUtc(new Date());
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Warm//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${icsEscape(opts.uid)}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${toIcsUtc(opts.start)}`,
    `DTEND:${toIcsUtc(opts.end)}`,
    `SUMMARY:${icsEscape(opts.summary)}`,
  ];
  if (opts.description)
    lines.push(`DESCRIPTION:${icsEscape(opts.description)}`);
  if (opts.location) lines.push(`LOCATION:${icsEscape(opts.location)}`);
  lines.push("END:VEVENT", "END:VCALENDAR");
  return lines.map((l) => foldLine(l)).join("\r\n") + "\r\n";
}
