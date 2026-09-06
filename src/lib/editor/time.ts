/** Wall-clock ↔ absolute instant helpers for a named IANA zone (no library needed). */

function partsInZone(date: Date, timeZone: string) {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const map: Record<string, number> = {};
  for (const p of dtf.formatToParts(date)) if (p.type !== "literal") map[p.type] = Number(p.value);
  return map;
}

/** Offset (minutes east of UTC) of `timeZone` at the given instant. */
export function zoneOffsetMinutes(date: Date, timeZone: string): number {
  const p = partsInZone(date, timeZone);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return Math.round((asUtc - date.getTime()) / 60000);
}

/** "2027-06-14T00:00" in `timeZone` → ISO 8601 with the zone's offset at that moment. */
export function wallTimeToIso(wall: string, timeZone: string): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(wall);
  if (!m) return null;
  const [, y, mo, d, h, mi] = m.map(Number);
  // First guess: treat the wall time as UTC, then correct by the zone offset (twice, for DST edges).
  let guess = Date.UTC(y, mo - 1, d, h, mi);
  for (let i = 0; i < 2; i++) guess = Date.UTC(y, mo - 1, d, h, mi) - zoneOffsetMinutes(new Date(guess), timeZone) * 60000;
  const offset = zoneOffsetMinutes(new Date(guess), timeZone);
  const sign = offset >= 0 ? "+" : "-";
  const abs = Math.abs(offset);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${y}-${pad(mo)}-${pad(d)}T${pad(h)}:${pad(mi)}:00${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`;
}

/** ISO instant → "YYYY-MM-DDTHH:mm" wall time in `timeZone` (for datetime-local inputs). */
export function isoToWallTime(iso: string, timeZone: string): string {
  const p = partsInZone(new Date(iso), timeZone);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${p.year}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}`;
}

export const COMMON_TIMEZONES = [
  "Europe/Madrid", "Europe/London", "Europe/Paris", "Europe/Berlin", "Europe/Rome", "Europe/Lisbon",
  "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "America/Toronto",
  "America/Mexico_City", "America/Bogota", "America/Lima", "America/Santiago", "America/Argentina/Buenos_Aires", "America/Sao_Paulo",
  "Asia/Tokyo", "Asia/Seoul", "Asia/Shanghai", "Asia/Singapore", "Asia/Dubai", "Asia/Kolkata", "Australia/Sydney", "Pacific/Auckland", "UTC",
];

export function allTimezones(): string[] {
  try {
    const all = Intl.supportedValuesOf("timeZone");
    return [...COMMON_TIMEZONES, ...all.filter((z) => !COMMON_TIMEZONES.includes(z))];
  } catch {
    return COMMON_TIMEZONES;
  }
}
