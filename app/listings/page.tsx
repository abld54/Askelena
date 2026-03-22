import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Filters } from "@/components/listings/filters";
import { ListingCard, type ListingCardData } from "@/components/listings/listing-card";
import { Pagination } from "@/components/listings/pagination";
import { MobileViewToggle } from "@/components/listings/map-toggle";
import type { MapListing } from "@/components/map";
import { Search } from "lucide-react";

const ITEMS_PER_PAGE = 12;

export const metadata = {
  title: "Rechercher un lieu | Askelena",
  description:
    "Parcourez notre collection de lieux d'exception : peniches, chateaux, phares, cabanes, yourtes et plus.",
};

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  const type = typeof params.type === "string" ? params.type : undefined;
  const city = typeof params.city === "string" ? params.city : undefined;
  const checkIn = typeof params.checkIn === "string" ? params.checkIn : undefined;
  const checkOut = typeof params.checkOut === "string" ? params.checkOut : undefined;
  const minPrice = typeof params.minPrice === "string" ? params.minPrice : undefined;
  const maxPrice = typeof params.maxPrice === "string" ? params.maxPrice : undefined;
  const capacity = typeof params.capacity === "string" ? params.capacity : undefined;
  const pageParam = typeof params.page === "string" ? params.page : "1";
  const page = Math.max(1, parseInt(pageParam, 10) || 1);

  // Resolve unavailable listing IDs when dates are provided
  let unavailableIds: string[] = [];
  if (checkIn && checkOut) {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    if (checkInDate < checkOutDate) {
      const [conflictingBookings, blockedDates] = await Promise.all([
        prisma.booking.findMany({
          where: {
            status: { in: ["confirmed", "pending"] },
            startDate: { lt: checkOutDate },
            endDate: { gt: checkInDate },
          },
          select: { listingId: true },
        }),
        prisma.blockedDate.findMany({
          where: {
            date: { gte: checkInDate, lt: checkOutDate },
          },
          select: { listingId: true },
        }),
      ]);
      unavailableIds = [
        ...new Set([
          ...conflictingBookings.map((b) => b.listingId),
          ...blockedDates.map((d) => d.listingId),
        ]),
      ];
    }
  }

  // Build where clause
  const where = {
    isPublished: true,
    ...(unavailableIds.length > 0 && { id: { notIn: unavailableIds } }),
    ...(type && { type }),
    ...(city && { location: { contains: city } }),
    ...(minPrice && { pricePerNight: { gte: parseFloat(minPrice) } }),
    ...(maxPrice && {
      pricePerNight: {
        ...(minPrice ? { gte: parseFloat(minPrice) } : {}),
        lte: parseFloat(maxPrice),
      },
    }),
    ...(capacity && { capacity: { gte: parseInt(capacity, 10) } }),
  };

  // Run queries in parallel
  const [listings, totalCount] = await Promise.all([
    prisma.listing.findMany({
      where,
      include: {
        images: { orderBy: { order: "asc" }, take: 1 },
        reviews: { select: { rating: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
    }),
    prisma.listing.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));

  // Transform for cards
  const cardData: ListingCardData[] = listings.map((l) => ({
    id: l.id,
    title: l.title,
    type: l.type,
    location: l.location,
    pricePerNight: l.pricePerNight,
    capacity: l.capacity,
    avgRating:
      l.reviews.length > 0
        ? l.reviews.reduce((sum, r) => sum + r.rating, 0) / l.reviews.length
        : null,
    reviewCount: l.reviews.length,
    imageUrl: l.images[0]?.url ?? null,
  }));

  // Transform for map (only those with coordinates)
  const mapListings: MapListing[] = listings
    .filter((l) => l.latitude != null && l.longitude != null)
    .map((l) => ({
      id: l.id,
      title: l.title,
      latitude: l.latitude!,
      longitude: l.longitude!,
      pricePerNight: l.pricePerNight,
      type: l.type,
    }));

  // Count active filters for badge
  const filterCount = [type, city, checkIn, checkOut, minPrice, maxPrice, capacity].filter(Boolean).length;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#FAF8F4] pt-16">
        {/* Page header */}
        <div className="bg-[#0F2044] py-10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h1
              className="text-3xl sm:text-4xl font-semibold text-white"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              Explorer les lieux
            </h1>
            <p className="text-white/60 mt-2 text-sm">
              {totalCount} lieu{totalCount !== 1 ? "x" : ""} disponible
              {totalCount !== 1 ? "s" : ""}
              {type || city ? " pour votre recherche" : ""}
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar filters - desktop */}
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-24 bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                <Suspense>
                  <Filters
                    currentType={type}
                    currentCity={city}
                    currentCheckIn={checkIn}
                    currentCheckOut={checkOut}
                    currentMinPrice={minPrice}
                    currentMaxPrice={maxPrice}
                    currentCapacity={capacity}
                  />
                </Suspense>
              </div>
            </aside>

            {/* Mobile filters - collapsible top bar */}
            <div className="lg:hidden">
              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2 text-sm font-medium text-[#0F2044]">
                    <Search className="w-4 h-4 text-[#C9A84C]" />
                    Filtres
                    {filterCount > 0 && (
                      <span className="bg-[#C9A84C] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {filterCount}
                      </span>
                    )}
                  </div>
                  <svg
                    className="w-4 h-4 text-gray-400 transition-transform group-open:rotate-180"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </summary>
                <div className="mt-2 bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                  <Suspense>
                    <Filters
                      currentType={type}
                      currentCity={city}
                      currentMinPrice={minPrice}
                      currentMaxPrice={maxPrice}
                      currentCapacity={capacity}
                    />
                  </Suspense>
                </div>
              </details>
            </div>

            {/* Main content */}
            <div className="flex-1 min-w-0">
              {cardData.length === 0 ? (
                /* No results state */
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 rounded-full bg-[#0F2044]/5 flex items-center justify-center mb-4">
                    <Search className="w-8 h-8 text-[#0F2044]/30" />
                  </div>
                  <h2
                    className="text-xl font-semibold text-[#0F2044] mb-2"
                    style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                  >
                    Aucun lieu trouve
                  </h2>
                  <p className="text-gray-500 text-sm max-w-md">
                    Essayez de modifier vos filtres ou d&apos;elargir votre recherche
                    pour decouvrir nos lieux d&apos;exception.
                  </p>
                </div>
              ) : (
                <MobileViewToggle mapListings={mapListings}>
                  {/* Results grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {cardData.map((listing) => (
                      <ListingCard key={listing.id} listing={listing} />
                    ))}
                  </div>
                  <Suspense>
                    <Pagination currentPage={page} totalPages={totalPages} />
                  </Suspense>
                </MobileViewToggle>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
