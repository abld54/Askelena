"use client";

import { useState, Suspense } from "react";
import { Map, List } from "lucide-react";
import { MapView, type MapListing } from "@/components/map";

type MapToggleProps = {
  mapListings: MapListing[];
  children: React.ReactNode; // the listing grid
};

/**
 * On mobile: toggles between list view and map view.
 * On desktop: both are shown side-by-side (this component only wraps the mobile toggle).
 */
export function MobileViewToggle({ mapListings, children }: MapToggleProps) {
  const [view, setView] = useState<"list" | "map">("list");

  return (
    <>
      {/* Mobile toggle button */}
      <div className="lg:hidden flex justify-center mb-4">
        <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => setView("list")}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors ${
              view === "list"
                ? "bg-[#0F2044] text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            <List className="w-4 h-4" />
            Liste
          </button>
          <button
            onClick={() => setView("map")}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors ${
              view === "map"
                ? "bg-[#0F2044] text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Map className="w-4 h-4" />
            Carte
          </button>
        </div>
      </div>

      {/* Mobile: show one or the other */}
      <div className="lg:hidden">
        {view === "list" ? (
          children
        ) : (
          <div className="h-[60vh] rounded-xl overflow-hidden">
            <Suspense
              fallback={
                <div className="h-full bg-[#FAF8F4] flex items-center justify-center">
                  <p className="text-sm text-gray-500">Chargement...</p>
                </div>
              }
            >
              <MapView listings={mapListings} />
            </Suspense>
          </div>
        )}
      </div>

      {/* Desktop: always show both */}
      <div className="hidden lg:grid lg:grid-cols-2 gap-6">
        <div>{children}</div>
        <div className="h-[calc(100vh-220px)] sticky top-24 rounded-xl overflow-hidden">
          <Suspense
            fallback={
              <div className="h-full bg-[#FAF8F4] flex items-center justify-center">
                <p className="text-sm text-gray-500">Chargement de la carte...</p>
              </div>
            }
          >
            <MapView listings={mapListings} />
          </Suspense>
        </div>
      </div>
    </>
  );
}
