import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { HostCalendar } from "@/components/booking/HostCalendar";
import Link from "next/link";

type Props = { searchParams: Promise<{ listingId?: string }> };

export default async function HostCalendarPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { listingId } = await searchParams;

  // List of host's listings
  const listings = await prisma.listing.findMany({
    where: { hostId: session.user.id },
    select: { id: true, title: true },
    orderBy: { createdAt: "desc" },
  });

  if (listings.length === 0) {
    return (
      <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-12 px-4">
        <div className="max-w-lg mx-auto text-center py-16 text-zinc-400">
          <p className="mb-4">Vous n'avez aucune annonce publiée.</p>
          <Link href="/host/listings/new" className="underline underline-offset-4 text-sm text-zinc-900 dark:text-zinc-100">
            Créer une annonce
          </Link>
        </div>
      </main>
    );
  }

  const activeListing = listingId
    ? listings.find((l) => l.id === listingId)
    : listings[0];

  if (!activeListing) notFound();

  const [blockedDates, bookings] = await Promise.all([
    prisma.blockedDate.findMany({
      where: { listingId: activeListing.id },
      orderBy: { date: "asc" },
    }),
    prisma.booking.findMany({
      where: {
        listingId: activeListing.id,
        status: { in: ["pending", "confirmed"] },
        endDate: { gte: new Date() },
      },
      include: { guest: { select: { name: true, email: true } } },
      orderBy: { startDate: "asc" },
    }),
  ]);

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-12 px-4">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Calendrier hôte</h1>
          <Link href="/host" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 underline underline-offset-4">
            Tableau de bord
          </Link>
        </div>

        {/* Listing switcher */}
        {listings.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {listings.map((l) => (
              <Link
                key={l.id}
                href={`/host/calendar?listingId=${l.id}`}
                className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                  l.id === activeListing.id
                    ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-transparent"
                    : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-400"
                }`}
              >
                {l.title}
              </Link>
            ))}
          </div>
        )}

        <HostCalendar
          listingId={activeListing.id}
          listingTitle={activeListing.title}
          initialBlockedDates={blockedDates.map((d) => ({
            id: d.id,
            date: d.date.toISOString(),
          }))}
          initialBookings={bookings.map((b) => ({
            id: b.id,
            startDate: b.startDate.toISOString(),
            endDate: b.endDate.toISOString(),
            nights: b.nights,
            totalPrice: b.totalPrice,
            status: b.status,
            guestName: b.guestName,
            guest: { name: b.guest.name, email: b.guest.email },
          }))}
        />
      </div>
    </main>
  );
}
