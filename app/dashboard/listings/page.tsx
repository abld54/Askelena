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
import { DeleteListingButton } from "./delete-button";

const typeLabels: Record<string, string> = {
  peniche: "Peniche",
  chateau: "Chateau",
  phare: "Phare",
  cabane: "Cabane",
  yourte: "Yourte",
  tiny_house: "Tiny House",
  autre: "Autre",
};

export default async function DashboardListingsPage() {
  const session = await auth();
  if (!session?.user?.id || (session.user as { role?: string }).role !== "host") {
    redirect("/login");
  }

  const listings = await prisma.listing.findMany({
    where: { hostId: session.user.id },
    include: {
      images: { orderBy: { order: "asc" }, take: 1 },
      bookings: { select: { id: true } },
      reviews: { select: { rating: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-heading font-bold text-navy">
            Mes annonces
          </h2>
          <p className="mt-1 text-sm text-navy/60">
            {listings.length} annonce{listings.length !== 1 ? "s" : ""} au total
          </p>
        </div>
        <Link
          href="/dashboard/listings/new"
          className="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-light"
        >
          <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nouvelle annonce
        </Link>
      </div>

      {/* Listings */}
      {listings.length === 0 ? (
        <Card className="border-none bg-white shadow-sm">
          <CardContent className="flex flex-col items-center py-16">
            <svg className="size-12 text-navy/20" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            <p className="mt-4 text-sm font-medium text-navy/60">
              Vous n&apos;avez pas encore d&apos;annonces
            </p>
            <Link
              href="/dashboard/listings/new"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-navy transition-colors hover:bg-gold-light"
            >
              Creer votre premiere annonce
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {listings.map((listing) => {
            const avgRating =
              listing.reviews.length > 0
                ? listing.reviews.reduce((s, r) => s + r.rating, 0) /
                  listing.reviews.length
                : null;

            return (
              <Card
                key={listing.id}
                className="border-none bg-white shadow-sm"
              >
                <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  {/* Thumbnail */}
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-cream">
                    {listing.images[0] ? (
                      <img
                        src={listing.images[0].url}
                        alt={listing.images[0].alt || listing.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <svg className="size-8 text-navy/20" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v13.5A1.5 1.5 0 0 0 3.75 21Z" />
                      </svg>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-heading font-semibold text-navy">
                        {listing.title}
                      </h3>
                      <Badge
                        variant={listing.isPublished ? "default" : "outline"}
                      >
                        {listing.isPublished ? "Publiee" : "Brouillon"}
                      </Badge>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-navy/50">
                      <span>{typeLabels[listing.type] ?? listing.type}</span>
                      <span>{listing.location}</span>
                      <span>
                        {listing.pricePerNight.toLocaleString("fr-FR", {
                          style: "currency",
                          currency: "EUR",
                        })}{" "}
                        / nuit
                      </span>
                      <span>{listing.capacity} voyageur{listing.capacity > 1 ? "s" : ""}</span>
                      <span>{listing.bookings.length} reservation{listing.bookings.length !== 1 ? "s" : ""}</span>
                      {avgRating && (
                        <span className="text-gold">
                          &#9733; {avgRating.toFixed(1)} ({listing.reviews.length})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 items-center gap-2">
                    <Link
                      href={`/dashboard/listings/${listing.id}/edit`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-navy/20 bg-white px-3 py-1.5 text-xs font-medium text-navy transition-colors hover:bg-cream"
                    >
                      <svg className="size-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                      </svg>
                      Modifier
                    </Link>
                    <DeleteListingButton listingId={listing.id} listingTitle={listing.title} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
