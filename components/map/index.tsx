"use client";

import dynamic from "next/dynamic";
import type { MapListing } from "./map-view";

const MapView = dynamic(() => import("./map-view").then((m) => m.MapView), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full rounded-xl bg-[#FAF8F4] flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-sm text-gray-500">Chargement de la carte...</p>
      </div>
    </div>
  ),
});

export { MapView };
export type { MapListing };
