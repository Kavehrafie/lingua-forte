import type { APIRoute } from "astro";
import { getSignup } from "@/lib/server/signup";
import { site } from "@/lib/site";
import { formatDateInTz } from "@/lib/time";

export const prerender = false;

// ICS dates are UTC in the form YYYYMMDDTHHMMSSZ. We pad-and-join manually
// because Intl.DateTimeFormat with the right options still returns
// locale-aware strings with punctuation we'd have to strip.
const toIcsStamp = (date: Date) =>
  date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

const escapeIcs = (value: string) =>
  value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");

export const GET: APIRoute = async ({ params }) => {
  const signup = await getSignup(params.id!);
  if (!signup) {
    return new Response("Not found", { status: 404 });
  }

  const start = signup.bookedFor;
  const end = new Date(start.getTime() + site.interviewDurationMinutes * 60_000);
  const now = new Date();
  const uid = `${signup.id}@linguaforte.com`;

  const summary = `${site.name} — Level Determination Interview`;
  const description = [
    `Hi ${signup.fullName},`,
    "",
    `Thanks for booking your interview for the ${signup.courseTitle} program.`,
    `We'll send a video link and any prep notes before ${formatDateInTz(start, {
      weekday: "long",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    })} (Eastern / Montréal).`,
    "",
    `Questions? Reach us at ${site.email} or ${site.phone}.`,
  ].join("\n");

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Lingua Forte//Signup//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${toIcsStamp(now)}`,
    `DTSTART:${toIcsStamp(start)}`,
    `DTEND:${toIcsStamp(end)}`,
    `SUMMARY:${escapeIcs(summary)}`,
    `DESCRIPTION:${escapeIcs(description)}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="lingua-forte-interview.ics"`,
    },
  });
};
