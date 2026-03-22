import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id || (session.user as { role?: string }).role !== "host") {
    redirect("/login");
  }

  const hostId = session.user.id;

  // Fetch all stats in parallel
  const [listings, bookings, reviews] = await Promise.all([
    prisma.listing.findMany({
      where: { hostId },
      select: { id: true, title: true, isPublished: true },
    }),
    prisma.booking.findMany({
      where: { listing: { hostId } },
      include: {
        listing: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.review.findMany({
      where: { listing: { hostId } },
      select: { rating: true },
    }),
  ]);

  const totalListings = listings.length;
  const totalBookings = bookings.length;
  const totalRevenue = bookings
    .filter((b) => b.status === "confirmed" || b.status === "completed")
    .reduce((sum, b) => sum + b.totalPrice, 0);
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const recentBookings = bookings.slice(0, 5);

  const statusLabels: Record<string, string> = {
    pending: "En attente",
    confirmed: "Confirmee",
    cancelled: "Annulee",
    completed: "Terminee",
  };

  const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    pending: "outline",
    confirmed: "default",
    cancelled: "destructive",
    completed: "secondary",
  };

  return (
    <div className="space-y-8">
      {/* Page title */}
      <div>
        <h2 className="text-2xl font-heading font-bold text-navy">
          Bienvenue, {session.user.name ?? "Hote"}
        </h2>
        <p className="mt-1 text-sm text-navy/60">
          Voici un apercu de votre activite
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-navy/50 text-xs font-medium uppercase tracking-wider">
              Annonces
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-heading font-bold text-navy">
              {totalListings}
            </div>
            <p className="mt-1 text-xs text-navy/40">
              {listings.filter((l) => l.isPublished).length} publiee{listings.filter((l) => l.isPublished).length > 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card className="border-none bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-navy/50 text-xs font-medium uppercase tracking-wider">
              Reservations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-heading font-bold text-navy">
              {totalBookings}
            </div>
            <p className="mt-1 text-xs text-navy/40">
              {bookings.filter((b) => b.status === "confirmed").length} confirmee{bookings.filter((b) => b.status === "confirmed").length > 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card className="border-none bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-navy/50 text-xs font-medium uppercase tracking-wider">
              Revenus
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-heading font-bold text-navy">
              {totalRevenue.toLocaleString("fr-FR", {
                style: "currency",
                currency: "EUR",
                maximumFractionDigits: 0,
              })}
            </div>
            <p className="mt-1 text-xs text-navy/40">
              Reservations confirmees et terminees
            </p>
          </CardContent>
        </Card>

        <Card className="border-none bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-navy/50 text-xs font-medium uppercase tracking-wider">
              Note moyenne
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-heading font-bold text-navy">
                {avgRating > 0 ? avgRating.toFixed(1) : "—"}
              </span>
              {avgRating > 0 && (
                <span className="text-gold text-lg">&#9733;</span>
              )}
            </div>
            <p className="mt-1 text-xs text-navy/40">
              {reviews.length} avis au total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/dashboard/listings/new"
          className="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-light"
        >
          <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Creer une annonce
        </Link>
        <Link
          href="/dashboard/calendar"
          className="inline-flex items-center gap-2 rounded-lg border border-navy/20 bg-white px-4 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-cream"
        >
          <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
          </svg>
          Voir le calendrier
        </Link>
      </div>

      {/* Recent bookings */}
      <Card className="border-none bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="font-heading text-navy">
            Reservations recentes
          </CardTitle>
          <CardDescription>
            Les 5 dernieres reservations recues
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentBookings.length === 0 ? (
            <p className="py-8 text-center text-sm text-navy/40">
              Aucune reservation pour le moment
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs font-medium uppercase tracking-wider text-navy/50">
                    <th className="pb-3 pr-4">Voyageur</th>
                    <th className="pb-3 pr-4">Annonce</th>
                    <th className="pb-3 pr-4">Dates</th>
                    <th className="pb-3 pr-4">Montant</th>
                    <th className="pb-3">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {recentBookings.map((booking) => (
                    <tr key={booking.id} className="text-navy/80">
                      <td className="py-3 pr-4 font-medium">
                        {booking.guestName}
                      </td>
                      <td className="py-3 pr-4">{booking.listing.title}</td>
                      <td className="py-3 pr-4 whitespace-nowrap">
                        {new Date(booking.startDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                        {" — "}
                        {new Date(booking.endDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                      </td>
                      <td className="py-3 pr-4 font-medium">
                        {booking.totalPrice.toLocaleString("fr-FR", {
                          style: "currency",
                          currency: "EUR",
                        })}
                      </td>
                      <td className="py-3">
                        <Badge variant={statusVariants[booking.status] ?? "outline"}>
                          {statusLabels[booking.status] ?? booking.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
