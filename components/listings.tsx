import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const TYPE_LABELS: Record<string, string> = {
  peniche: "Péniche",
  chateau: "Château",
  villa: "Villa",
  treehouse: "Cabane perchée",
  phare: "Phare",
  cabane: "Cabane",
  yourte: "Yourte",
  other: "Lieu d'exception",
};

const TYPE_GRADIENTS: Record<string, string> = {
  peniche: "from-blue-800 via-blue-700 to-blue-600",
  chateau: "from-stone-700 via-stone-600 to-amber-800",
  villa: "from-emerald-800 via-emerald-700 to-teal-600",
  treehouse: "from-green-800 via-green-700 to-emerald-600",
  phare: "from-teal-800 via-teal-700 to-cyan-600",
  cabane: "from-green-800 via-green-700 to-emerald-600",
  yourte: "from-orange-800 via-amber-700 to-yellow-700",
  other: "from-indigo-800 via-blue-700 to-blue-600",
};

const TYPE_EMOJIS: Record<string, string> = {
  peniche: "⚓",
  chateau: "🏰",
  villa: "🏡",
  treehouse: "🌲",
  phare: "🔦",
  cabane: "🌲",
  yourte: "🏕️",
  other: "✦",
};

function StarIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-[#C9A84C] fill-current" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

export async function Listings() {
  const listings = await prisma.listing.findMany({
    where: { isPublished: true },
    include: {
      images: { orderBy: { order: "asc" }, take: 1 },
      reviews: { select: { rating: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  if (listings.length === 0) {
    return (
      <section className="bg-white py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center py-16 text-gray-400">
          <p className="text-lg">Aucune annonce disponible pour l’instant.</p>
          <Link
            href="/host/listings/new"
            className="mt-4 inline-block text-[#C9A84C] underline underline-offset-4 text-sm"
          >
            Créer une annonce →
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12 gap-4">
          <div>
            <p className="text-[#C9A84C] text-xs font-semibold tracking-widest uppercase mb-3">
              Sélection du moment
            </p>
            <h2
              className="text-4xl sm:text-5xl font-heading font-semibold text-[#0F2044]"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              Lieux populaires
            </h2>
          </div>
          <Link
            href="/listings"
            className="text-[#0F2044] text-sm font-medium border border-[#0F2044]/20 hover:border-[#C9A84C] hover:text-[#C9A84C] px-5 py-2.5 rounded-full transition-all duration-200 self-start sm:self-auto"
          >
            Voir tout →
          </Link>
        </div>

        {/* Listings grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => {
            const avgRating =
              listing.reviews.length > 0
                ? listing.reviews.reduce((sum, r) => sum + r.rating, 0) /
                  listing.reviews.length
                : null;
            const gradient =
              TYPE_GRADIENTS[listing.type] ?? TYPE_GRADIENTS.other;
            const emoji = TYPE_EMOJIS[listing.type] ?? "✦";
            const typeLabel = TYPE_LABELS[listing.type] ?? listing.type;

            return (
              <Link key={listing.id} href={`/listings/${listing.id}`}>
                <Card className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 rounded-2xl cursor-pointer">
                  {/* Image area */}
                  <div className="relative h-52 overflow-hidden">
                    {listing.images[0] ? (
                      <Image
                        src={listing.images[0].url}
                        alt={listing.images[0].alt || listing.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <>
                        <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
                        <div className="absolute inset-0 opacity-20 flex items-center justify-center">
                          <span className="text-7xl">{emoji}</span>
                        </div>
                      </>
                    )}
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                    {/* Bottom price */}
                    <div className="absolute bottom-3 left-3">
                      <span className="text-white font-semibold text-lg">
                        {listing.pricePerNight.toFixed(0)} €
                      </span>
                      <span className="text-white/70 text-xs ml-1">/ nuit</span>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <p className="text-[#C9A84C] text-xs font-medium tracking-wide uppercase mb-1">
                      {typeLabel}
                    </p>
                    <h3
                      className="text-[#0F2044] font-heading font-semibold text-lg leading-tight mb-1 group-hover:text-[#1B3A6B] transition-colors duration-200"
                      style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                    >
                      {listing.title}
                    </h3>
                    <div className="flex items-center gap-1 text-gray-400 text-xs mb-3">
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {listing.location}
                    </div>
                    {avgRating !== null ? (
                      <div className="flex items-center gap-1.5">
                        <StarIcon />
                        <span className="text-[#0F2044] text-sm font-semibold">
                          {avgRating.toFixed(2)}
                        </span>
                        <span className="text-gray-400 text-xs">
                          ({listing.reviews.length} avis)
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <Badge className="bg-[#C9A84C]/10 text-[#C9A84C] border-[#C9A84C]/20 text-xs">
                          Nouveau
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
