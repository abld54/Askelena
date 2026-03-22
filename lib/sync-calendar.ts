import { prisma } from "@/lib/prisma";
import { fetchAndParseICal } from "@/lib/ical";
import { eachDayOfInterval, startOfDay } from "date-fns";

export interface SyncResult {
  syncId: string;
  platform: string;
  success: boolean;
  eventsFound: number;
  datesBlocked: number;
  error?: string;
}

/**
 * Syncs all active CalendarSync records for a given listing.
 * - Fetches external iCal URLs
 * - Creates BlockedDate records for booked date ranges
 * - Removes stale synced blocked dates no longer present in external calendars
 */
export async function syncCalendar(listingId: string): Promise<SyncResult[]> {
  const syncs = await prisma.calendarSync.findMany({
    where: { listingId, isActive: true },
  });

  const results: SyncResult[] = [];

  for (const sync of syncs) {
    try {
      const events = await fetchAndParseICal(sync.icalUrl);

      // Determine the source tag based on platform
      const source = sync.platform === "airbnb" ? "airbnb" : sync.platform === "booking" ? "booking" : "sync";

      // Collect all individual dates from the iCal events
      const newDates = new Set<string>();
      for (const event of events) {
        const start = startOfDay(event.start);
        // iCal DTEND for all-day events is exclusive, so subtract 1 day
        const end = new Date(event.end);
        end.setDate(end.getDate() - 1);
        const endClamped = startOfDay(end < start ? start : end);

        const days = eachDayOfInterval({ start, end: endClamped });
        for (const day of days) {
          newDates.add(day.toISOString().split("T")[0]);
        }
      }

      // Get existing synced blocked dates for this listing (non-manual ones matching this source)
      const existingSynced = await prisma.blockedDate.findMany({
        where: {
          listingId,
          source,
        },
        select: { id: true, date: true },
      });

      const existingDateMap = new Map<string, string>();
      for (const bd of existingSynced) {
        const key = startOfDay(bd.date).toISOString().split("T")[0];
        existingDateMap.set(key, bd.id);
      }

      // Dates to add (in external calendar but not in our DB)
      const datesToAdd: Date[] = [];
      for (const dateStr of newDates) {
        if (!existingDateMap.has(dateStr)) {
          datesToAdd.push(startOfDay(new Date(dateStr)));
        }
      }

      // Dates to remove (in our DB but no longer in external calendar)
      const idsToRemove: string[] = [];
      for (const [dateStr, id] of existingDateMap) {
        if (!newDates.has(dateStr)) {
          idsToRemove.push(id);
        }
      }

      // Apply changes
      if (datesToAdd.length > 0) {
        await prisma.$transaction(
          datesToAdd.map((date) =>
            prisma.blockedDate.upsert({
              where: { listingId_date: { listingId, date } },
              create: { listingId, date, source },
              update: { source },
            })
          )
        );
      }

      if (idsToRemove.length > 0) {
        await prisma.blockedDate.deleteMany({
          where: { id: { in: idsToRemove } },
        });
      }

      // Update sync record
      await prisma.calendarSync.update({
        where: { id: sync.id },
        data: { lastSyncAt: new Date(), lastError: null },
      });

      results.push({
        syncId: sync.id,
        platform: sync.platform,
        success: true,
        eventsFound: events.length,
        datesBlocked: datesToAdd.length,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur inconnue";

      await prisma.calendarSync.update({
        where: { id: sync.id },
        data: { lastError: errorMessage },
      });

      results.push({
        syncId: sync.id,
        platform: sync.platform,
        success: false,
        eventsFound: 0,
        datesBlocked: 0,
        error: errorMessage,
      });
    }
  }

  return results;
}
