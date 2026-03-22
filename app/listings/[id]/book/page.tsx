import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { BookingForm } from "@/components/booking/BookingForm";

type Props = { params: Promise<{ id: string }> };

export default async function BookPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;

  const listing = await prisma.listing.findUnique({
    where: { id, isPublished: true },
    include: {
      images: { orderBy: { order: "asc" }, take: 1 },
      host: { select: { id: true, name: true, image: true } },
    },
  });

  if (!listing) notFound();

  // Hosts can't book their own listing
  if (listing.hostId === session.user.id) {
    redirect(`/listings/${id}`);
  }

  // Fetch unavailable dates
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  let unavailableDates: string[] = [];
  try {
    const res = await fetch(`${baseUrl}/api/listings/${id}/availability`, {
      cache: "no-store",
    });
    if (res.ok) {
      unavailableDates = await res.json();
    }
  } catch {
    // Non-blocking
  }

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-1">Réserver</h1>
          <p className="text-zinc-600 dark:text-zinc-400">{listing.title}</p>
          <p className="text-zinc-500 dark:text-zinc-500 text-sm">{listing.location}</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-100 dark:border-zinc-800">
            <span className="text-sm text-zinc-500">Prix par nuit</span>
            <span className="text-xl font-semibold">{listing.pricePerNight.toFixed(2)} €</span>
          </div>

          <BookingForm
            listingId={id}
            pricePerNight={listing.pricePerNight}
            unavailableDates={unavailableDates}
            listingTitle={listing.title}
          />
        </div>

        <p className="text-xs text-center text-zinc-400 mt-4">
          Paiement sécurisé via Stripe. Vous ne serez débité qu'après confirmation.
        </p>
      </div>
    </main>
  );
}
