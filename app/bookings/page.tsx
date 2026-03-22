import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente de paiement",
  confirmed: "Confirmée",
  cancelled: "Annulée",
  completed: "Terminée",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  confirmed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  completed: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
};

export default async function BookingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const bookings = await prisma.booking.findMany({
    where: { guestId: session.user.id },
    include: {
      listing: {
        include: { images: { orderBy: { order: "asc" }, take: 1 } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold mb-8">Mes réservations</h1>

        {bookings.length === 0 ? (
          <div className="text-center py-16 text-zinc-400">
            <p className="mb-4">Aucune réservation pour le moment.</p>
            <Link
              href="/"
              className="text-zinc-900 dark:text-zinc-100 underline underline-offset-4 font-medium"
            >
              Explorer les annonces
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {bookings.map((booking) => {
              const img = booking.listing.images[0];
              return (
                <li key={booking.id}>
                  <Link
                    href={`/bookings/${booking.id}`}
                    className="flex gap-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
                  >
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={img.url}
                        alt={img.alt || booking.listing.title}
                        className="w-20 h-20 object-cover rounded-lg shrink-0"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-lg shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{booking.listing.title}</p>
                      <p className="text-sm text-zinc-500 truncate">{booking.listing.location}</p>
                      <p className="text-sm mt-1">
                        {format(booking.startDate, "d MMM", { locale: fr })} –{" "}
                        {format(booking.endDate, "d MMM yyyy", { locale: fr })}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[booking.status] ?? ""}`}
                        >
                          {STATUS_LABELS[booking.status] ?? booking.status}
                        </span>
                        <span className="text-sm font-semibold">{booking.totalPrice.toFixed(2)} €</span>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
