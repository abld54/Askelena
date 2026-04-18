"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Loader2 } from "lucide-react";

const LISTING_TYPES = [
  { value: "peniche", label: "Péniche" },
  { value: "chateau", label: "Château" },
  { value: "phare", label: "Phare" },
  { value: "cabane", label: "Cabane" },
  { value: "yourte", label: "Yourte" },
  { value: "other", label: "Autre lieu d'exception" },
];

const AMENITY_OPTIONS = [
  { value: "wifi", label: "WiFi" },
  { value: "parking", label: "Parking" },
  { value: "kitchen", label: "Cuisine" },
  { value: "pool", label: "Piscine" },
  { value: "terrace", label: "Terrasse" },
  { value: "fireplace", label: "Cheminée" },
  { value: "spa", label: "Spa" },
  { value: "barbecue", label: "Barbecue" },
  { value: "pets", label: "Animaux acceptés" },
  { value: "bike", label: "Vélos" },
  { value: "boat", label: "Bateau" },
  { value: "kayak", label: "Kayak" },
];

export interface ListingFormData {
  id?: string;
  title: string;
  description: string;
  type: string;
  location: string;
  address: string;
  pricePerNight: number;
  capacity: number;
  amenities: string[];
  isPublished: boolean;
  images: { id?: string; url: string; alt: string }[];
}

interface Props {
  initialData?: ListingFormData;
  mode: "create" | "edit";
}

export function ListingForm({ initialData, mode }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [type, setType] = useState(initialData?.type ?? "peniche");
  const [location, setLocation] = useState(initialData?.location ?? "");
  const [address, setAddress] = useState(initialData?.address ?? "");
  const [pricePerNight, setPricePerNight] = useState(
    initialData?.pricePerNight?.toString() ?? ""
  );
  const [capacity, setCapacity] = useState(
    initialData?.capacity?.toString() ?? ""
  );
  const [amenities, setAmenities] = useState<string[]>(initialData?.amenities ?? []);
  const [isPublished, setIsPublished] = useState(initialData?.isPublished ?? false);
  const [images, setImages] = useState<{ url: string; alt: string }[]>(
    initialData?.images?.map((img) => ({ url: img.url, alt: img.alt })) ?? []
  );
  const [newImageUrl, setNewImageUrl] = useState("");

  function toggleAmenity(value: string) {
    setAmenities((prev) =>
      prev.includes(value) ? prev.filter((a) => a !== value) : [...prev, value]
    );
  }

  function addImage() {
    const url = newImageUrl.trim();
    if (!url) return;
    setImages((prev) => [...prev, { url, alt: "" }]);
    setNewImageUrl("");
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const payload = {
      title: title.trim(),
      description: description.trim(),
      type,
      location: location.trim(),
      address: address.trim() || undefined,
      pricePerNight: parseFloat(pricePerNight),
      capacity: parseInt(capacity, 10),
      amenities,
      isPublished,
      images,
    };

    if (!payload.title || !payload.description || !payload.location) {
      setError("Titre, description et localisation sont requis.");
      return;
    }
    if (isNaN(payload.pricePerNight) || payload.pricePerNight <= 0) {
      setError("Le prix par nuit doit être un nombre positif.");
      return;
    }
    if (isNaN(payload.capacity) || payload.capacity < 1) {
      setError("La capacité doit être au moins 1.");
      return;
    }

    startTransition(async () => {
      try {
        const url =
          mode === "create"
            ? "/api/listings"
            : `/api/listings/${initialData!.id}`;
        const method = mode === "create" ? "POST" : "PUT";

        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const data = await res.json();
          setError(data.error ?? "Une erreur est survenue.");
          return;
        }

        const listing = await res.json();
        router.push(`/host/listings`);
        router.refresh();
        if (mode === "create") {
          router.push(`/listings/${listing.id}`);
        }
      } catch {
        setError("Impossible de soumettre le formulaire.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Basic info */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-[#0F2044]">Informations générales</h2>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Titre de l’annonce *</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex. La Belle Époque — Péniche Canal Saint-Martin"
            required
            className="h-10"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Type de lieu *</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full h-10 rounded-lg border border-input bg-transparent px-3 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {LISTING_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Description *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Décrivez votre lieu : atmosphère, particularités, vue, activités à proximité..."
            required
            rows={5}
            className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-none"
          />
        </div>
      </section>

      {/* Location */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-[#0F2044]">Localisation</h2>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Ville / Région *</label>
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Ex. Paris, Canal Saint-Martin"
            required
            className="h-10"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Adresse complète</label>
          <Input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Ex. 12 quai de Valmy, 75010 Paris"
            className="h-10"
          />
        </div>
      </section>

      {/* Price & capacity */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-[#0F2044]">Tarif et capacité</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Prix par nuit (€) *</label>
            <Input
              type="number"
              min="1"
              step="0.01"
              value={pricePerNight}
              onChange={(e) => setPricePerNight(e.target.value)}
              placeholder="Ex. 280"
              required
              className="h-10"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Capacité (personnes) *</label>
            <Input
              type="number"
              min="1"
              max="100"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder="Ex. 6"
              required
              className="h-10"
            />
          </div>
        </div>
      </section>

      {/* Amenities */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-[#0F2044]">Équipements</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {AMENITY_OPTIONS.map((amenity) => (
            <label
              key={amenity.value}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm transition-colors ${
                amenities.includes(amenity.value)
                  ? "border-[#C9A84C] bg-[#C9A84C]/5 text-[#0F2044]"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={amenities.includes(amenity.value)}
                onChange={() => toggleAmenity(amenity.value)}
              />
              <span
                className={`w-4 h-4 rounded border shrink-0 flex items-center justify-center text-xs ${
                  amenities.includes(amenity.value)
                    ? "bg-[#C9A84C] border-[#C9A84C] text-white"
                    : "border-gray-300"
                }`}
              >
                {amenities.includes(amenity.value) ? "✓" : ""}
              </span>
              {amenity.label}
            </label>
          ))}
        </div>
      </section>

      {/* Photos */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-[#0F2044]">Photos</h2>
        <p className="text-sm text-gray-500">Ajoutez des URLs d’images pour illustrer votre annonce.</p>

        <div className="flex gap-2">
          <Input
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            placeholder="https://example.com/photo.jpg"
            className="h-10 flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addImage();
              }
            }}
          />
          <Button type="button" variant="outline" onClick={addImage} size="default">
            <Plus className="w-4 h-4" />
            Ajouter
          </Button>
        </div>

        {images.length > 0 && (
          <div className="space-y-2">
            {images.map((img, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={img.alt || "Photo"}
                  className="w-12 h-12 object-cover rounded-md shrink-0 bg-gray-200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <span className="text-sm text-gray-600 truncate flex-1">{img.url}</span>
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Publish toggle */}
      <section className="space-y-2">
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            className={`relative w-10 h-6 rounded-full transition-colors ${
              isPublished ? "bg-[#C9A84C]" : "bg-gray-200"
            }`}
            onClick={() => setIsPublished((v) => !v)}
          >
            <div
              className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                isPublished ? "translate-x-5" : "translate-x-1"
              }`}
            />
          </div>
          <input
            type="checkbox"
            className="sr-only"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
          />
          <span className="text-sm font-medium text-gray-700">
            {isPublished ? "Annonce publiée (visible par tous)" : "Brouillon (non visible)"}
          </span>
        </label>
      </section>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <Button
          type="submit"
          disabled={isPending}
          className="bg-[#C9A84C] hover:bg-[#B8973B] text-white"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {mode === "create" ? "Création..." : "Mise à jour..."}
            </>
          ) : mode === "create" ? (
            "Créer l'annonce"
          ) : (
            "Enregistrer les modifications"
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Annuler
        </Button>
      </div>
    </form>
  );
}
