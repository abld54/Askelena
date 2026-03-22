export interface ICalEvent {
  start: Date;
  end: Date;
  summary?: string;
}

/**
 * Lightweight iCal parser — handles Airbnb / Booking.com feeds.
 * Parses VEVENT blocks and extracts DTSTART, DTEND, SUMMARY.
 */
function parseICal(text: string): ICalEvent[] {
  const events: ICalEvent[] = [];
  const blocks = text.split("BEGIN:VEVENT");

  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i].split("END:VEVENT")[0];
    if (!block) continue;

    let start: Date | null = null;
    let end: Date | null = null;
    let summary: string | undefined;

    for (const rawLine of block.split(/\r?\n/)) {
      const line = rawLine.trim();

      if (line.startsWith("DTSTART")) {
        start = parseICalDate(line);
      } else if (line.startsWith("DTEND")) {
        end = parseICalDate(line);
      } else if (line.startsWith("SUMMARY")) {
        summary = line.replace(/^SUMMARY[^:]*:/, "").trim();
      }
    }

    if (start && end) {
      events.push({ start, end, summary });
    }
  }

  return events;
}

/**
 * Parse an iCal date line like:
 *   DTSTART;VALUE=DATE:20260401
 *   DTSTART:20260401T140000Z
 */
function parseICalDate(line: string): Date | null {
  const match = line.match(/(\d{4})(\d{2})(\d{2})(T(\d{2})(\d{2})(\d{2})Z?)?/);
  if (!match) return null;

  const [, year, month, day, , hour, minute, second] = match;
  if (hour) {
    return new Date(
      Date.UTC(+year, +month - 1, +day, +hour, +minute, +second)
    );
  }
  return new Date(+year, +month - 1, +day);
}

/**
 * Fetches an iCal URL and parses VEVENT entries into date ranges.
 */
export async function fetchAndParseICal(url: string): Promise<ICalEvent[]> {
  const response = await fetch(url, {
    headers: { "User-Agent": "Askelena/1.0 Calendar-Sync" },
  });

  if (!response.ok) {
    throw new Error(`Impossible de récupérer le calendrier : HTTP ${response.status}`);
  }

  const text = await response.text();
  return parseICal(text);
}
