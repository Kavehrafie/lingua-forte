// All times in the app are surfaced in Montréal / Eastern time. The DB
// stores UTC instants (Date objects / unix timestamps); this helper is the
// single place that knows how to format them for display and how to parse
// datetime-local strings entered by an admin in Eastern time.
//
// "America/Toronto" is the canonical IANA name for Eastern Time and covers
// Montréal — they've shared DST rules since 1973. "America/Montreal" is an
// alias but Toronto is more widely supported across runtime tz databases.

export const TIMEZONE = "America/Toronto";

export const formatDateInTz = (
  date: Date,
  options: Intl.DateTimeFormatOptions = {},
) =>
  new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    ...options,
  }).format(date);

// datetime-local inputs serialize as "YYYY-MM-DDTHH:mm". `new Date(that)`
// interprets it in the *runtime's* local zone, which is UTC on Cloudflare —
// so a 14:30 entry from a Montréal admin would land in the DB as 14:30 UTC.
// We need to interpret the wall-clock string as Eastern and return the
// matching UTC instant.
//
// Trick: treat the wall-clock as UTC to get an approximate instant, read
// the tz offset at that instant, then subtract the offset.
export const parseDateTimeLocalInTz = (input: string): Date => {
  const iso = input.length === 16 ? `${input}:00` : input;
  const approxUtcMs = Date.parse(`${iso}Z`);
  if (Number.isNaN(approxUtcMs)) return new Date(NaN);

  const offsetMin = tzOffsetMinutes(new Date(approxUtcMs), TIMEZONE);
  return new Date(approxUtcMs - offsetMin * 60_000);
};

const partsCache = new Map<string, Intl.DateTimeFormat>();

const getParts = (date: Date, tz: string) => {
  let fmt = partsCache.get(tz);
  if (!fmt) {
    fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    partsCache.set(tz, fmt);
  }
  const out: Record<string, number> = {};
  for (const p of fmt.formatToParts(date)) {
    if (p.type === "literal") continue;
    out[p.type] = Number(p.value);
  }
  if (out.hour === 24) out.hour = 0;
  return out;
};

const tzOffsetMinutes = (date: Date, tz: string): number => {
  const u = getParts(date, "UTC");
  const t = getParts(date, tz);
  const utcMs = Date.UTC(u.year, u.month - 1, u.day, u.hour, u.minute, u.second);
  const tzMs = Date.UTC(t.year, t.month - 1, t.day, t.hour, t.minute, t.second);
  return Math.round((utcMs - tzMs) / 60_000);
};
