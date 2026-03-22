import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

/**
 * Generates a valid iCal (VCALENDAR) string for a listing,
 * containing all confirmed/pending bookings and blocked dates.
 */
export async function generateICalFeed(listingId: string): Promise<string> {
  const [bookings, blockedDates, listing] = await Promise.all([
    prisma.booking.findMany({
      where: {
        listingId,
        status: { in: ["pending", "confirmed"] },
      },
      select: { id: true, startDate: true, endDate: true, guestName: true, status: true },
    }),
    prisma.blockedDate.findMany({
      where: { listingId },
      select: { id: true, date: true, source: true },
      orderBy: { date: "asc" },
    }),
    prisma.listing.findUnique({
      where: { id: listingId },
      select: { title: true },
    }),
  ]);

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Askelena//Calendar//FR",
    `X-WR-CALNAME:${listing?.title ?? "Askelena Listing"}`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];

  // Add bookings as events
  for (const booking of bookings) {
    const dtstart = formatICalDate(booking.startDate);
    const dtend = formatICalDate(booking.endDate);
    const now = formatICalDateTime(new Date());

    lines.push(
      "BEGIN:VEVENT",
      `DTSTART;VALUE=DATE:${dtstart}`,
      `DTEND;VALUE=DATE:${dtend}`,
      `DTSTAMP:${now}`,
      `UID:booking-${booking.id}@askelena.com`,
      `SUMMARY:Askelena - Réservé`,
      `DESCRIPTION:Réservation ${booking.status === "confirmed" ? "confirmée" : "en attente"}`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
    );
  }

  // Group consecutive blocked dates into ranges for cleaner output
  const ranges = groupConsecutiveDates(blockedDates.map((bd) => bd.date));
  for (let i = 0; i < ranges.length; i++) {
    const range = ranges[i];
    const dtstart = formatICalDate(range.start);
    // iCal DTEND for all-day events is exclusive (day after last day)
    const endDate = new Date(range.end);
    endDate.setDate(endDate.getDate() + 1);
    const dtend = formatICalDate(endDate);
    const now = formatICalDateTime(new Date());

    lines.push(
      "BEGIN:VEVENT",
      `DTSTART;VALUE=DATE:${dtstart}`,
      `DTEND;VALUE=DATE:${dtend}`,
      `DTSTAMP:${now}`,
      `UID:blocked-${i}-${dtstart}@askelena.com`,
      `SUMMARY:Askelena - Non disponible`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
    );
  }

  lines.push("END:VCALENDAR");

  return lines.join("\r\n");
}

function formatICalDate(date: Date): string {
  return format(date, "yyyyMMdd");
}

function formatICalDateTime(date: Date): string {
  return format(date, "yyyyMMdd'T'HHmmss'Z'");
}

function groupConsecutiveDates(dates: Date[]): Array<{ start: Date; end: Date }> {
  if (dates.length === 0) return [];

  const sorted = [...dates].sort((a, b) => a.getTime() - b.getTime());
  const ranges: Array<{ start: Date; end: Date }> = [];

  let start = sorted[0];
  let end = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const diff = (current.getTime() - end.getTime()) / (1000 * 60 * 60 * 24);

    if (diff <= 1.5) {
      // consecutive (allow slight float drift)
      end = current;
    } else {
      ranges.push({ start, end });
      start = current;
      end = current;
    }
  }

  ranges.push({ start, end });
  return ranges;
}
