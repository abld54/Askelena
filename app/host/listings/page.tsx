import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Calendar, Eye } from "lucide-react";
import { DeleteListingButton } from "@/components/host/DeleteListingButton";

export default async function HostListingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const listings = await prisma.listing.findMany({
    where: { hostId: session.user.id },
    include: {
      images: { orderBy: { order: "asc" }, take: 1 },
      bookings: {
        where: { status: { in: ["pending", "confirmed"] } },
        select: { id: true },
      },
      reviews: { select: { rating: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-2xl font-semibold text-[#0F2044]"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              Mes annonces
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {listings.length} annonce{listings.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Link href="/host/listings/new">
            <Button className="bg-[#C9A84C] hover:bg-[#B8973B] text-white">
              <Plus className="w-4 h-4" />
              Nouvelle annonce
            </Button>
          </Link>
        </div>

        {/* Listings */}
        {listings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
            <div className="text-5xl mb-4">⚓</div>
            <h2 className="text-lg font-semibold text-[#0F2044] mb-2">
              Aucune annonce pour l'instant
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Créez votre première annonce et commencez à accueillir des voyageurs.
            </p>
            <Link href="/host/listings/new">
              <Button className="bg-[#C9A84C] hover:bg-[#B8973B] text-white">
                <Plus className="w-4 h-4" />
                Créer une annonce
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {listings.map((listing) => {
              const avgRating =
                listing.reviews.length > 0
                  ? listing.reviews.reduce((sum, r) => sum + r.rating, 0) /
                    listing.reviews.length
                  : null;

              return (
                <div
                  key={listing.id}
                  className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-4 hover:border-gray-300 transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-[#0F2044] to-[#1B3A6B] shrink-0 relative">
                    {listing.images[0] ? (
                      <Image
                        src={listing.images[0].url}
                        alt={listing.images[0].alt || listing.title}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl text-white/40">
                        ⚓
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-[#0F2044] truncate">
                        {listing.title}
                      </span>
                      <Badge
                        className={
                          listing.isPublished
                            ? "bg-green-50 text-green-700 border-green-200 text-xs"
                            : "bg-gray-100 text-gray-500 border-gray-200 text-xs"
                        }
                      >
                        {listing.isPublished ? "Publié" : "Brouillon"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{listing.location}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      <span>{listing.pricePerNight.toFixed(0)} €/nuit</span>
                      <span>·</span>
                      <span>{listing.capacity} pers.</span>
                      {avgRating !== null && (
                        <>
                          <span>·</span>
                          <span>★ {avgRating.toFixed(1)}</span>
                        </>
                      )}
                      {listing.bookings.length > 0 && (
                        <>
                          <span>·</span>
                          <span className="text-[#C9A84C] font-medium">
                            {listing.bookings.length} réservation{listing.bookings.length > 1 ? "s" : ""} active{listing.bookings.length > 1 ? "s" : ""}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {listing.isPublished && (
                      <Link href={`/listings/${listing.id}`}>
                        <Button variant="ghost" size="icon" title="Voir l'annonce">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                    )}
                    <Link href={`/host/calendar?listingId=${listing.id}`}>
                      <Button variant="ghost" size="icon" title="Calendrier">
                        <Calendar className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Link href={`/host/listings/${listing.id}/edit`}>
                      <Button variant="ghost" size="icon" title="Modifier">
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </Link>
                    <DeleteListingButton
                      listingId={listing.id}
                      listingTitle={listing.title}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
