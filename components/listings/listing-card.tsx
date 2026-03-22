import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Users } from "lucide-react";

const TYPE_CONFIG: Record<string, { label: string; emoji: string; gradient: string }> = {
  peniche: { label: "Peniche", emoji: "⚓", gradient: "from-blue-800 via-blue-700 to-blue-600" },
  chateau: { label: "Chateau", emoji: "🏰", gradient: "from-stone-700 via-stone-600 to-amber-800" },
  phare: { label: "Phare", emoji: "🔦", gradient: "from-teal-800 via-teal-700 to-cyan-600" },
  cabane: { label: "Cabane", emoji: "🌲", gradient: "from-green-800 via-green-700 to-emerald-600" },
  yourte: { label: "Yourte", emoji: "🏕️", gradient: "from-orange-800 via-amber-700 to-yellow-700" },
  tiny_house: { label: "Tiny House", emoji: "🏠", gradient: "from-violet-800 via-purple-700 to-indigo-600" },
  autre: { label: "Autre", emoji: "✨", gradient: "from-gray-700 via-gray-600 to-gray-500" },
};

function StarIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-[#C9A84C] fill-current" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

export type ListingCardData = {
  id: string;
  title: string;
  type: string;
  location: string;
  pricePerNight: number;
  capacity: number;
  avgRating: number | null;
  reviewCount: number;
  imageUrl: string | null;
};

export function ListingCard({ listing }: { listing: ListingCardData }) {
  const config = TYPE_CONFIG[listing.type] ?? TYPE_CONFIG.autre;

  return (
    <Link href={`/listings/${listing.id}`} className="block">
      <Card className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 rounded-2xl cursor-pointer">
        {/* Image area */}
        <div className="relative h-48 overflow-hidden">
          {listing.imageUrl ? (
            <img
              src={listing.imageUrl}
              alt={listing.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <>
              <div
                className={`absolute inset-0 bg-gradient-to-br ${config.gradient}`}
              />
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl">
                  {config.emoji}
                </div>
              </div>
            </>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

          {/* Type badge */}
          <div className="absolute top-3 left-3">
            <Badge className="text-xs font-semibold px-2.5 py-1 border-0 bg-white/20 backdrop-blur-sm text-white">
              {config.emoji} {config.label}
            </Badge>
          </div>

          {/* Price */}
          <div className="absolute bottom-3 left-3">
            <span className="text-white font-semibold text-lg">
              {listing.pricePerNight} €
            </span>
            <span className="text-white/70 text-xs ml-1">/ nuit</span>
          </div>

          {/* Capacity */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1 text-white/80 text-xs">
            <Users className="w-3.5 h-3.5" />
            <span>{listing.capacity}</span>
          </div>
        </div>

        <CardContent className="p-4">
          {/* Title */}
          <h3
            className="text-[#0F2044] font-semibold text-base leading-tight mb-1 group-hover:text-[#1B3A6B] transition-colors duration-200"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            {listing.title}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1 text-gray-400 text-xs mb-2">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{listing.location}</span>
          </div>

          {/* Rating */}
          {listing.avgRating !== null ? (
            <div className="flex items-center gap-1.5">
              <StarIcon />
              <span className="text-[#0F2044] text-sm font-semibold">
                {listing.avgRating.toFixed(2)}
              </span>
              <span className="text-gray-400 text-xs">
                ({listing.reviewCount} avis)
              </span>
            </div>
          ) : (
            <span className="text-gray-400 text-xs">Pas encore d&apos;avis</span>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
