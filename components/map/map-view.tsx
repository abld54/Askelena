"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons (Leaflet + webpack/bundler issue)
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

const goldIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export type MapListing = {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  pricePerNight: number;
  type: string;
};

function FitBounds({ listings }: { listings: MapListing[] }) {
  const map = useMap();
  const prevCount = useRef(listings.length);

  useEffect(() => {
    if (listings.length === 0) return;
    if (listings.length !== prevCount.current || prevCount.current === 0) {
      const bounds = L.latLngBounds(
        listings.map((l) => [l.latitude, l.longitude])
      );
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
    }
    prevCount.current = listings.length;
  }, [listings, map]);

  return null;
}

const TYPE_LABELS: Record<string, string> = {
  peniche: "Peniche",
  chateau: "Chateau",
  phare: "Phare",
  cabane: "Cabane",
  yourte: "Yourte",
  tiny_house: "Tiny House",
  autre: "Autre",
};

export function MapView({ listings }: { listings: MapListing[] }) {
  return (
    <MapContainer
      center={[46.6, 2.3]}
      zoom={5}
      className="h-full w-full rounded-xl"
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {listings.map((listing) => (
        <Marker
          key={listing.id}
          position={[listing.latitude, listing.longitude]}
          icon={goldIcon}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-semibold text-[#0F2044]">{listing.title}</p>
              <p className="text-xs text-gray-500">
                {TYPE_LABELS[listing.type] ?? listing.type}
              </p>
              <p className="font-medium text-[#C9A84C]">
                {listing.pricePerNight} € / nuit
              </p>
              <a
                href={`/listings/${listing.id}`}
                className="text-xs text-[#1B3A6B] underline"
              >
                Voir le lieu
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
      {listings.length > 0 && <FitBounds listings={listings} />}
    </MapContainer>
  );
}
