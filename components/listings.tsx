import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const listings = [
  {
    id: 1,
    title: "La Belle Époque",
    type: "Péniche",
    location: "Paris, Canal Saint-Martin",
    price: 280,
    rating: 4.97,
    reviews: 124,
    tag: "Coup de cœur",
    tagColor: "#C9A84C",
    emoji: "⚓",
    gradient: "from-blue-800 via-blue-700 to-blue-600",
    nights: "nuit",
  },
  {
    id: 2,
    title: "Château de Valmont",
    type: "Château",
    location: "Vallée de la Loire",
    price: 850,
    rating: 4.95,
    reviews: 67,
    tag: "Prestige",
    tagColor: "#8B7355",
    emoji: "🏰",
    gradient: "from-stone-700 via-stone-600 to-amber-800",
    nights: "nuit",
  },
  {
    id: 3,
    title: "Phare du Finistère",
    type: "Phare",
    location: "Pointe du Raz, Bretagne",
    price: 195,
    rating: 4.98,
    reviews: 89,
    tag: "Rare",
    tagColor: "#2DD4BF",
    emoji: "🔦",
    gradient: "from-teal-800 via-teal-700 to-cyan-600",
    nights: "nuit",
  },
  {
    id: 4,
    title: "Les Cimes Dorées",
    type: "Cabane",
    location: "Forêt des Landes",
    price: 165,
    rating: 4.93,
    reviews: 201,
    tag: "Nature",
    tagColor: "#4ADE80",
    emoji: "🌲",
    gradient: "from-green-800 via-green-700 to-emerald-600",
    nights: "nuit",
  },
  {
    id: 5,
    title: "Yourte Céleste",
    type: "Yourte",
    location: "Massif Central, Auvergne",
    price: 120,
    rating: 4.91,
    reviews: 156,
    tag: "Populaire",
    tagColor: "#FBBF24",
    emoji: "🏕️",
    gradient: "from-orange-800 via-amber-700 to-yellow-700",
    nights: "nuit",
  },
  {
    id: 6,
    title: "Le Confetti Bleu",
    type: "Péniche",
    location: "Bruges, Belgique",
    price: 220,
    rating: 4.96,
    reviews: 88,
    tag: "International",
    tagColor: "#A78BFA",
    emoji: "⚓",
    gradient: "from-indigo-800 via-blue-700 to-blue-600",
    nights: "nuit",
  },
];

function StarIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-[#C9A84C] fill-current" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

export function Listings() {
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
          <button className="text-[#0F2044] text-sm font-medium border border-[#0F2044]/20 hover:border-[#C9A84C] hover:text-[#C9A84C] px-5 py-2.5 rounded-full transition-all duration-200 self-start sm:self-auto">
            Voir tout →
          </button>
        </div>

        {/* Listings grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <Card
              key={listing.id}
              className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 rounded-2xl cursor-pointer"
            >
              {/* Image area */}
              <div className="relative h-52 overflow-hidden">
                {/* Gradient background as placeholder */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${listing.gradient}`}
                />
                {/* Decorative pattern */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-7xl">
                    {listing.emoji}
                  </div>
                </div>
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                {/* Tag */}
                <div className="absolute top-3 left-3">
                  <Badge
                    className="text-xs font-semibold px-2.5 py-1 border-0"
                    style={{
                      backgroundColor: `${listing.tagColor}22`,
                      color: listing.tagColor,
                      borderColor: `${listing.tagColor}44`,
                    }}
                  >
                    {listing.tag}
                  </Badge>
                </div>

                {/* Wishlist button */}
                <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/40 transition-colors duration-200">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </button>

                {/* Bottom price */}
                <div className="absolute bottom-3 left-3">
                  <span className="text-white font-semibold text-lg">
                    {listing.price} €
                  </span>
                  <span className="text-white/70 text-xs ml-1">/ {listing.nights}</span>
                </div>
              </div>

              <CardContent className="p-4">
                {/* Type */}
                <p className="text-[#C9A84C] text-xs font-medium tracking-wide uppercase mb-1">
                  {listing.type}
                </p>

                {/* Title */}
                <h3
                  className="text-[#0F2044] font-heading font-semibold text-lg leading-tight mb-1 group-hover:text-[#1B3A6B] transition-colors duration-200"
                  style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                >
                  {listing.title}
                </h3>

                {/* Location */}
                <div className="flex items-center gap-1 text-gray-400 text-xs mb-3">
                  <svg
                    className="w-3.5 h-3.5 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
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
                  {listing.location}
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1.5">
                  <StarIcon />
                  <span className="text-[#0F2044] text-sm font-semibold">
                    {listing.rating}
                  </span>
                  <span className="text-gray-400 text-xs">
                    ({listing.reviews} avis)
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
