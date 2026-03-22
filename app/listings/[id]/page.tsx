import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Props = { params: Promise<{ id: string }> };

const TYPE_LABELS: Record<string, string> = {
  peniche: "Peniche",
  chateau: "Chateau",
  villa: "Villa",
  treehouse: "Cabane perchee",
  other: "Lieu d'exception",
};

const TYPE_EMOJI: Record<string, string> = {
  peniche: "⚓",
  chateau: "🏰",
  villa: "🏡",
  treehouse: "🌲",
  other: "✦",
};

const TYPE_GRADIENT: Record<string, string> = {
  peniche: "from-blue-800 via-blue-700 to-blue-600",
  chateau: "from-stone-700 via-stone-600 to-amber-800",
  villa: "from-emerald-800 via-emerald-700 to-teal-600",
  treehouse: "from-green-800 via-green-700 to-emerald-600",
  other: "from-[#0F2044] via-[#1B3A6B] to-[#0F2044]",
};

const AMENITY_ICONS: Record<string, string> = {
  wifi: "📶",
  parking: "🅿️",
  kitchen: "🍳",
  pool: "🏊",
  terrace: "🌿",
  fireplace: "🔥",
  spa: "🧖",
  barbecue: "🥩",
  pets: "🐾",
  bike: "🚲",
  boat: "⛵",
  kayak: "🛶",
  climatisation: "❄️",
  "machine-a-laver": "🧺",
  jacuzzi: "🛁",
  jardin: "🌳",
  vue: "👀",
  "petit-dejeuner": "🥐",
};

const AMENITY_LABELS: Record<string, string> = {
  wifi: "Wi-Fi",
  parking: "Parking",
  kitchen: "Cuisine",
  pool: "Piscine",
  terrace: "Terrasse",
  fireplace: "Cheminee",
  spa: "Spa",
  barbecue: "Barbecue",
  pets: "Animaux acceptes",
  bike: "Velos",
  boat: "Bateau",
  kayak: "Kayak",
  climatisation: "Climatisation",
  "machine-a-laver": "Machine a laver",
  jacuzzi: "Jacuzzi",
  jardin: "Jardin",
  vue: "Vue exceptionnelle",
  "petit-dejeuner": "Petit-dejeuner",
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i <= Math.round(rating) ? "text-[#C9A84C] fill-current" : "text-gray-300 fill-current"}`}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function LocationIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  );
}

// Dynamic metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const listing = await prisma.listing.findUnique({
    where: { id },
    select: { title: true, description: true, location: true, type: true, images: { take: 1, orderBy: { order: "asc" } } },
  });

  if (!listing) {
    return { title: "Annonce introuvable | Askelena" };
  }

  return {
    title: `${listing.title} - ${TYPE_LABELS[listing.type] ?? listing.type} | Askelena`,
    description: listing.description.slice(0, 160),
    openGraph: {
      title: listing.title,
      description: listing.description.slice(0, 160),
      ...(listing.images[0]?.url ? { images: [listing.images[0].url] } : {}),
    },
  };
}

export default async function ListingDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      images: { orderBy: { order: "asc" } },
      host: { select: { id: true, name: true, image: true, bio: true, createdAt: true } },
      reviews: {
        include: {
          author: { select: { id: true, name: true, image: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!listing || !listing.isPublished) notFound();

  const avgRating =
    listing.reviews.length > 0
      ? listing.reviews.reduce((sum, r) => sum + r.rating, 0) / listing.reviews.length
      : null;

  let amenities: string[] = [];
  try {
    amenities = JSON.parse(listing.amenities);
  } catch {
    amenities = [];
  }

  const isHost = session?.user?.id === listing.hostId;
  const gradient = TYPE_GRADIENT[listing.type] ?? TYPE_GRADIENT.other;
  const emoji = TYPE_EMOJI[listing.type] ?? "✦";
  const hostJoinYear = listing.host.createdAt
    ? new Date(listing.host.createdAt).getFullYear()
    : null;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#FAF8F4] pt-16">
        {/* Back nav */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#0F2044] transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Retour aux annonces
          </Link>
        </div>

        {/* Gallery */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          {listing.images.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-2 h-[300px] md:h-[460px] rounded-2xl overflow-hidden">
              {/* Main image */}
              <div className="md:col-span-2 md:row-span-2 relative bg-gray-100">
                <Image
                  src={listing.images[0].url}
                  alt={listing.images[0].alt || listing.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </div>
              {/* Side images */}
              {listing.images.slice(1, 5).map((img, i) => (
                <div key={img.id} className="relative bg-gray-100 hidden md:block">
                  <Image
                    src={img.url}
                    alt={img.alt || listing.title}
                    fill
                    className="object-cover"
                    sizes="25vw"
                  />
                  {i === 3 && listing.images.length > 5 && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        +{listing.images.length - 5} photos
                      </span>
                    </div>
                  )}
                </div>
              ))}
              {/* Fill empty slots with gradient placeholders */}
              {listing.images.length < 5 &&
                Array.from({ length: 4 - (listing.images.length - 1) }).map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className={`hidden md:flex bg-gradient-to-br ${gradient} items-center justify-center`}
                  >
                    <span className="text-4xl opacity-30">{emoji}</span>
                  </div>
                ))}
            </div>
          ) : (
            /* No images — gradient placeholder */
            <div className={`h-[300px] md:h-[460px] rounded-2xl bg-gradient-to-br ${gradient} flex flex-col items-center justify-center gap-4`}>
              <span className="text-8xl opacity-30">{emoji}</span>
              <span className="text-white/40 text-sm font-medium tracking-wide uppercase">
                {TYPE_LABELS[listing.type] ?? listing.type}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left: details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title + meta */}
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Badge className="mb-3 bg-[#C9A84C]/10 text-[#C9A84C] border-[#C9A84C]/20 hover:bg-[#C9A84C]/15">
                    {TYPE_LABELS[listing.type] ?? listing.type}
                  </Badge>
                  <h1
                    className="text-3xl sm:text-4xl font-semibold text-[#0F2044] leading-tight"
                    style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                  >
                    {listing.title}
                  </h1>
                  <div className="flex items-center gap-1.5 mt-2 text-gray-500 text-sm">
                    <LocationIcon className="w-4 h-4 shrink-0" />
                    <span>{listing.location}</span>
                    {listing.address && (
                      <>
                        <span className="text-gray-300">·</span>
                        <span>{listing.address}</span>
                      </>
                    )}
                  </div>
                </div>
                {isHost && (
                  <Link href={`/host/listings/${id}/edit`}>
                    <Button variant="outline" size="sm" className="border-[#0F2044]/20 text-[#0F2044] hover:border-[#C9A84C] hover:text-[#C9A84C]">
                      Modifier
                    </Button>
                  </Link>
                )}
              </div>

              {/* Rating + capacity */}
              <div className="flex flex-wrap items-center gap-4 mt-4">
                {avgRating !== null && (
                  <div className="flex items-center gap-1.5">
                    <StarRating rating={avgRating} />
                    <span className="font-semibold text-[#0F2044] text-sm">
                      {avgRating.toFixed(2)}
                    </span>
                    <span className="text-gray-400 text-xs">
                      ({listing.reviews.length} avis)
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-gray-500 text-sm">
                  <UsersIcon className="w-4 h-4" />
                  <span>Jusqu&apos;a {listing.capacity} personnes</span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200/60" />

            {/* Host info card */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#0F2044]/10 overflow-hidden shrink-0 flex items-center justify-center">
                  {listing.host.image ? (
                    <Image
                      src={listing.host.image}
                      alt={listing.host.name ?? "Hote"}
                      width={56}
                      height={56}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <span className="text-[#0F2044] font-semibold text-xl">
                      {listing.host.name?.[0]?.toUpperCase() ?? "H"}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-0.5">
                    Hebergement propose par
                  </p>
                  <p
                    className="font-semibold text-[#0F2044] text-lg"
                    style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                  >
                    {listing.host.name}
                  </p>
                  {hostJoinYear && (
                    <p className="text-xs text-gray-400">Membre depuis {hostJoinYear}</p>
                  )}
                </div>
              </div>
              {listing.host.bio && (
                <p className="text-gray-500 text-sm leading-relaxed mt-3 pl-[72px]">
                  {listing.host.bio}
                </p>
              )}
            </div>

            <div className="border-t border-gray-200/60" />

            {/* Description */}
            <div>
              <h2
                className="text-xl font-semibold text-[#0F2044] mb-3"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
              >
                A propos de ce lieu
              </h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {listing.description}
              </p>
            </div>

            {/* Amenities */}
            {amenities.length > 0 && (
              <>
                <div className="border-t border-gray-200/60" />
                <div>
                  <h2
                    className="text-xl font-semibold text-[#0F2044] mb-4"
                    style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                  >
                    Equipements
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {amenities.map((amenity) => (
                      <div
                        key={amenity}
                        className="flex items-center gap-3 bg-white rounded-lg border border-gray-100 px-4 py-3 text-sm text-gray-700"
                      >
                        <span className="text-lg">{AMENITY_ICONS[amenity] ?? "✓"}</span>
                        <span>{AMENITY_LABELS[amenity] ?? amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Reviews */}
            {listing.reviews.length > 0 && (
              <>
                <div className="border-t border-gray-200/60" />
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <h2
                      className="text-xl font-semibold text-[#0F2044]"
                      style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                    >
                      Avis
                    </h2>
                    {avgRating !== null && (
                      <div className="flex items-center gap-1.5 bg-[#C9A84C]/10 rounded-full px-3 py-1">
                        <svg className="w-4 h-4 text-[#C9A84C] fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-sm font-semibold text-[#C9A84C]">
                          {avgRating.toFixed(2)}
                        </span>
                        <span className="text-xs text-[#C9A84C]/70">
                          / 5 · {listing.reviews.length} avis
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-5">
                    {listing.reviews.map((review) => (
                      <div key={review.id} className="bg-white rounded-xl border border-gray-100 p-5">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-[#0F2044]/10 overflow-hidden shrink-0 flex items-center justify-center">
                            {review.author.image ? (
                              <Image
                                src={review.author.image}
                                alt={review.author.name ?? ""}
                                width={40}
                                height={40}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <span className="text-[#0F2044] text-sm font-semibold">
                                {review.author.name?.[0]?.toUpperCase() ?? "?"}
                              </span>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-[#0F2044] text-sm">{review.author.name}</p>
                            <p className="text-xs text-gray-400">
                              {new Date(review.createdAt).toLocaleDateString("fr-FR", {
                                year: "numeric",
                                month: "long",
                              })}
                            </p>
                          </div>
                          <StarRating rating={review.rating} />
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {review.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {listing.reviews.length === 0 && (
              <>
                <div className="border-t border-gray-200/60" />
                <div className="text-center py-8">
                  <p className="text-gray-400 text-sm">Aucun avis pour le moment</p>
                  <p className="text-gray-300 text-xs mt-1">Soyez le premier a donner votre avis !</p>
                </div>
              </>
            )}
          </div>

          {/* Right: booking card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              {/* Price header */}
              <div className="bg-[#0F2044] px-6 py-5">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-bold text-white">
                    {listing.pricePerNight.toFixed(0)} EUR
                  </span>
                  <span className="text-white/60 text-sm">/ nuit</span>
                </div>
                {avgRating !== null && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <svg className="w-3.5 h-3.5 text-[#C9A84C] fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="font-semibold text-sm text-white">
                      {avgRating.toFixed(2)}
                    </span>
                    <span className="text-white/50 text-xs">
                      · {listing.reviews.length} avis
                    </span>
                  </div>
                )}
              </div>

              {/* Booking actions */}
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <UsersIcon className="w-4 h-4" />
                  <span>Jusqu&apos;a {listing.capacity} personnes</span>
                </div>

                {!session ? (
                  <Link href="/login" className="block">
                    <Button className="w-full bg-[#C9A84C] hover:bg-[#E5C158] text-[#0F2044] font-semibold text-base py-6 rounded-xl transition-colors duration-200">
                      Connexion pour reserver
                    </Button>
                  </Link>
                ) : isHost ? (
                  <Link href={`/host/listings/${id}/edit`} className="block">
                    <Button variant="outline" className="w-full border-[#0F2044]/20 text-[#0F2044] hover:border-[#C9A84C] hover:text-[#C9A84C] font-semibold py-6 rounded-xl">
                      Gerer cette annonce
                    </Button>
                  </Link>
                ) : (
                  <Link href={`/listings/${id}/book`} className="block">
                    <Button className="w-full bg-[#C9A84C] hover:bg-[#E5C158] text-[#0F2044] font-semibold text-base py-6 rounded-xl transition-colors duration-200">
                      Reserver maintenant
                    </Button>
                  </Link>
                )}

                <p className="text-xs text-center text-gray-400">
                  Aucun frais avant confirmation
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
