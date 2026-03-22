import { prisma } from "@/lib/prisma";
import { differenceInCalendarDays, eachDayOfInterval, startOfDay } from "date-fns";

/**
 * Returns all dates that are unavailable for a listing:
 * - Existing confirmed/pending bookings
 * - Host-blocked dates
 */
export async function getUnavailableDates(listingId: string): Promise<Date[]> {
  const [bookings, blockedDates] = await Promise.all([
    prisma.booking.findMany({
      where: {
        listingId,
        status: { in: ["pending", "confirmed"] },
      },
      select: { startDate: true, endDate: true },
    }),
    prisma.blockedDate.findMany({
      where: { listingId },
      select: { date: true },
    }),
  ]);

  const dates: Date[] = [];

  for (const booking of bookings) {
    const days = eachDayOfInterval({
      start: startOfDay(booking.startDate),
      end: startOfDay(booking.endDate),
    });
    dates.push(...days);
  }

  for (const bd of blockedDates) {
    dates.push(startOfDay(bd.date));
  }

  return dates;
}

/**
 * Checks if a date range is available for a listing.
 */
export async function isRangeAvailable(
  listingId: string,
  startDate: Date,
  endDate: Date,
  excludeBookingId?: string
): Promise<boolean> {
  const conflicting = await prisma.booking.findFirst({
    where: {
      listingId,
      id: excludeBookingId ? { not: excludeBookingId } : undefined,
      status: { in: ["pending", "confirmed"] },
      OR: [
        // New range starts during existing booking
        { startDate: { lte: endDate }, endDate: { gte: startDate } },
      ],
    },
  });

  if (conflicting) return false;

  // Check blocked dates
  const blockedInRange = await prisma.blockedDate.findFirst({
    where: {
      listingId,
      date: { gte: startDate, lte: endDate },
    },
  });

  return !blockedInRange;
}

export function calculateNights(startDate: Date, endDate: Date): number {
  return differenceInCalendarDays(endDate, startDate);
}

export function calculateTotalPrice(
  pricePerNight: number,
  nights: number
): { subtotal: number; serviceFee: number; total: number } {
  const subtotal = pricePerNight * nights;
  // 12% service fee
  const serviceFee = Math.round(subtotal * 0.12 * 100) / 100;
  const total = Math.round((subtotal + serviceFee) * 100) / 100;
  return { subtotal, serviceFee, total };
}
