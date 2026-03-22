"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X, SlidersHorizontal } from "lucide-react";

const LISTING_TYPES = [
  { value: "peniche", label: "Peniche", emoji: "⚓" },
  { value: "chateau", label: "Chateau", emoji: "🏰" },
  { value: "phare", label: "Phare", emoji: "🔦" },
  { value: "cabane", label: "Cabane", emoji: "🌲" },
  { value: "yourte", label: "Yourte", emoji: "🏕️" },
  { value: "tiny_house", label: "Tiny House", emoji: "🏠" },
  { value: "autre", label: "Autre", emoji: "✨" },
] as const;

type FiltersProps = {
  currentType?: string;
  currentCity?: string;
  currentCheckIn?: string;
  currentCheckOut?: string;
  currentMinPrice?: string;
  currentMaxPrice?: string;
  currentCapacity?: string;
};

export function Filters({
  currentType,
  currentCity,
  currentCheckIn,
  currentCheckOut,
  currentMinPrice,
  currentMaxPrice,
  currentCapacity,
}: FiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      // Reset to page 1 when filters change
      params.delete("page");

      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }

      startTransition(() => {
        router.push(`/listings?${params.toString()}`);
      });
    },
    [router, searchParams, startTransition]
  );

  const clearAll = useCallback(() => {
    startTransition(() => {
      router.push("/listings");
    });
  }, [router, startTransition]);

  const hasFilters =
    currentType || currentCity || currentCheckIn || currentCheckOut || currentMinPrice || currentMaxPrice || currentCapacity;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#C9A84C]" />
          <h2 className="font-semibold text-[#0F2044] text-sm uppercase tracking-wide">
            Filtres
          </h2>
        </div>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="text-xs text-gray-500 hover:text-[#C9A84C] transition-colors flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Effacer
          </button>
        )}
      </div>

      {/* Location */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1.5">
          Localisation
        </label>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <Input
            type="text"
            placeholder="Ville, region..."
            defaultValue={currentCity ?? ""}
            className="pl-8 h-9 text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                updateParams({ city: (e.target as HTMLInputElement).value || undefined });
              }
            }}
            onBlur={(e) => {
              if (e.target.value !== (currentCity ?? "")) {
                updateParams({ city: e.target.value || undefined });
              }
            }}
          />
        </div>
      </div>

      {/* Dates */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1.5">
          Dates de disponibilité
        </label>
        <div className="space-y-2">
          <div>
            <label className="block text-[10px] text-gray-400 mb-1">Arrivée</label>
            <Input
              type="date"
              defaultValue={currentCheckIn ?? ""}
              min={new Date().toISOString().split("T")[0]}
              className="h-9 text-sm"
              onChange={(e) => {
                const value = e.target.value;
                // If check-out is before new check-in, clear it
                const updates: Record<string, string | undefined> = { checkIn: value || undefined };
                if (currentCheckOut && value && currentCheckOut <= value) {
                  updates.checkOut = undefined;
                }
                updateParams(updates);
              }}
            />
          </div>
          <div>
            <label className="block text-[10px] text-gray-400 mb-1">Départ</label>
            <Input
              type="date"
              defaultValue={currentCheckOut ?? ""}
              min={currentCheckIn
                ? (() => {
                    const d = new Date(currentCheckIn);
                    d.setDate(d.getDate() + 1);
                    return d.toISOString().split("T")[0];
                  })()
                : new Date().toISOString().split("T")[0]}
              className="h-9 text-sm"
              onChange={(e) => {
                updateParams({ checkOut: e.target.value || undefined });
              }}
            />
          </div>
        </div>
      </div>

      {/* Type */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-2">
          Type de lieu
        </label>
        <div className="flex flex-wrap gap-2">
          {LISTING_TYPES.map(({ value, label, emoji }) => {
            const isActive = currentType === value;
            return (
              <button
                key={value}
                onClick={() =>
                  updateParams({ type: isActive ? undefined : value })
                }
                className={`
                  inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                  border transition-all duration-200
                  ${
                    isActive
                      ? "bg-[#C9A84C]/10 border-[#C9A84C]/40 text-[#C9A84C]"
                      : "bg-white border-gray-200 text-gray-600 hover:border-[#C9A84C]/30 hover:text-[#0F2044]"
                  }
                `}
              >
                <span>{emoji}</span>
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price range */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1.5">
          Prix par nuit (EUR)
        </label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            min={0}
            defaultValue={currentMinPrice ?? ""}
            className="h-9 text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                updateParams({
                  minPrice: (e.target as HTMLInputElement).value || undefined,
                });
              }
            }}
            onBlur={(e) => {
              if (e.target.value !== (currentMinPrice ?? "")) {
                updateParams({ minPrice: e.target.value || undefined });
              }
            }}
          />
          <span className="text-gray-400 text-xs">-</span>
          <Input
            type="number"
            placeholder="Max"
            min={0}
            defaultValue={currentMaxPrice ?? ""}
            className="h-9 text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                updateParams({
                  maxPrice: (e.target as HTMLInputElement).value || undefined,
                });
              }
            }}
            onBlur={(e) => {
              if (e.target.value !== (currentMaxPrice ?? "")) {
                updateParams({ maxPrice: e.target.value || undefined });
              }
            }}
          />
        </div>
      </div>

      {/* Capacity */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1.5">
          Capacite minimum
        </label>
        <Input
          type="number"
          placeholder="Nb de voyageurs"
          min={1}
          defaultValue={currentCapacity ?? ""}
          className="h-9 text-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              updateParams({
                capacity: (e.target as HTMLInputElement).value || undefined,
              });
            }
          }}
          onBlur={(e) => {
            if (e.target.value !== (currentCapacity ?? "")) {
              updateParams({ capacity: e.target.value || undefined });
            }
          }}
        />
      </div>

      {/* Apply note */}
      {isPending && (
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <div className="w-3 h-3 border border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
          Mise a jour...
        </div>
      )}
    </div>
  );
}

/** Compact mobile filter bar - shown as a top bar on small screens */
export function MobileFilterToggle({
  hasFilters,
  filterCount,
}: {
  hasFilters: boolean;
  filterCount: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <SlidersHorizontal className="w-4 h-4" />
      <span>Filtres</span>
      {hasFilters && (
        <span className="ml-1 bg-[#C9A84C] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
          {filterCount}
        </span>
      )}
    </div>
  );
}
