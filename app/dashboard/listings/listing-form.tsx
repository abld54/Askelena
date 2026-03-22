"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const LISTING_TYPES = [
  { value: "peniche", label: "Peniche" },
  { value: "chateau", label: "Chateau" },
  { value: "phare", label: "Phare" },
  { value: "cabane", label: "Cabane" },
  { value: "yourte", label: "Yourte" },
  { value: "tiny_house", label: "Tiny House" },
  { value: "autre", label: "Autre" },
] as const;

const AMENITIES = [
  "WiFi",
  "Parking",
  "Cuisine equipee",
  "Lave-linge",
  "Climatisation",
  "Chauffage",
  "Piscine",
  "Jacuzzi",
  "Terrasse",
  "Vue mer",
  "Vue montagne",
  "Animaux acceptes",
  "Acces PMR",
  "Barbecue",
  "Cheminee",
] as const;

export type ListingFormData = {
  title: string;
  description: string;
  type: string;
  location: string;
  address: string;
  latitude: string;
  longitude: string;
  pricePerNight: string;
  capacity: string;
  amenities: string[];
  isPublished: boolean;
  imageUrls: string[];
};

type Props = {
  mode: "create" | "edit";
  listingId?: string;
  initialData?: ListingFormData;
};

const defaultData: ListingFormData = {
  title: "",
  description: "",
  type: "peniche",
  location: "",
  address: "",
  latitude: "",
  longitude: "",
  pricePerNight: "",
  capacity: "",
  amenities: [],
  isPublished: false,
  imageUrls: [""],
};

export function ListingForm({ mode, listingId, initialData }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<ListingFormData>(initialData ?? defaultData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateField<K extends keyof ListingFormData>(
    key: K,
    value: ListingFormData[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleAmenity(amenity: string) {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  }

  function updateImageUrl(index: number, value: string) {
    setForm((prev) => {
      const urls = [...prev.imageUrls];
      urls[index] = value;
      return { ...prev, imageUrls: urls };
    });
  }

  function addImageUrl() {
    setForm((prev) => ({
      ...prev,
      imageUrls: [...prev.imageUrls, ""],
    }));
  }

  function removeImageUrl(index: number) {
    setForm((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const body = {
        title: form.title.trim(),
        description: form.description.trim(),
        type: form.type,
        location: form.location.trim(),
        address: form.address.trim() || undefined,
        latitude: form.latitude ? parseFloat(form.latitude) : undefined,
        longitude: form.longitude ? parseFloat(form.longitude) : undefined,
        pricePerNight: parseFloat(form.pricePerNight),
        capacity: parseInt(form.capacity, 10),
        amenities: form.amenities,
        isPublished: form.isPublished,
        ...(mode === "create"
          ? {
              images: form.imageUrls
                .filter((u) => u.trim())
                .map((url) => ({ url: url.trim() })),
            }
          : {}),
      };

      const url =
        mode === "create"
          ? "/api/listings"
          : `/api/listings/${listingId}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Une erreur est survenue");
      }

      router.push("/dashboard/listings");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Basic info */}
      <Card className="border-none bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="font-heading text-navy">
            Informations generales
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy/80">
              Titre <span className="text-red-500">*</span>
            </label>
            <Input
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="Ex: Peniche de charme sur le Canal du Midi"
              required
              className="h-10"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy/80">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Decrivez votre lieu d'exception..."
              required
              rows={5}
              className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-navy/80">
                Type de lieu <span className="text-red-500">*</span>
              </label>
              <select
                value={form.type}
                onChange={(e) => updateField("type", e.target.value)}
                required
                className="h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {LISTING_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-navy/80">
                Capacite (voyageurs) <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                min={1}
                max={50}
                value={form.capacity}
                onChange={(e) => updateField("capacity", e.target.value)}
                placeholder="4"
                required
                className="h-10"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy/80">
              Prix par nuit (EUR) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              min={1}
              step="0.01"
              value={form.pricePerNight}
              onChange={(e) => updateField("pricePerNight", e.target.value)}
              placeholder="120.00"
              required
              className="h-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card className="border-none bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="font-heading text-navy">
            Localisation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy/80">
              Ville / Region <span className="text-red-500">*</span>
            </label>
            <Input
              value={form.location}
              onChange={(e) => updateField("location", e.target.value)}
              placeholder="Ex: Toulouse, Occitanie"
              required
              className="h-10"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy/80">
              Adresse complete
            </label>
            <Input
              value={form.address}
              onChange={(e) => updateField("address", e.target.value)}
              placeholder="Ex: 12 quai de la Daurade, 31000 Toulouse"
              className="h-10"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-navy/80">
                Latitude
              </label>
              <Input
                type="number"
                step="any"
                value={form.latitude}
                onChange={(e) => updateField("latitude", e.target.value)}
                placeholder="43.6047"
                className="h-10"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-navy/80">
                Longitude
              </label>
              <Input
                type="number"
                step="any"
                value={form.longitude}
                onChange={(e) => updateField("longitude", e.target.value)}
                placeholder="1.4442"
                className="h-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Amenities */}
      <Card className="border-none bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="font-heading text-navy">
            Equipements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {AMENITIES.map((amenity) => (
              <label
                key={amenity}
                className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                  form.amenities.includes(amenity)
                    ? "border-gold bg-gold/10 text-navy font-medium"
                    : "border-gray-200 bg-white text-navy/70 hover:border-gray-300"
                }`}
              >
                <input
                  type="checkbox"
                  checked={form.amenities.includes(amenity)}
                  onChange={() => toggleAmenity(amenity)}
                  className="sr-only"
                />
                <div
                  className={`flex size-4 shrink-0 items-center justify-center rounded border transition-colors ${
                    form.amenities.includes(amenity)
                      ? "border-gold bg-gold text-white"
                      : "border-gray-300"
                  }`}
                >
                  {form.amenities.includes(amenity) && (
                    <svg className="size-3" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  )}
                </div>
                {amenity}
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Images */}
      <Card className="border-none bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="font-heading text-navy">
            Photos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-navy/50">
            Ajoutez les URL de vos photos. Le telechargement direct sera disponible prochainement.
          </p>
          {form.imageUrls.map((url, i) => (
            <div key={i} className="flex gap-2">
              <Input
                value={url}
                onChange={(e) => updateImageUrl(i, e.target.value)}
                placeholder="https://exemple.com/photo.jpg"
                className="h-10 flex-1"
              />
              {form.imageUrls.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeImageUrl(i)}
                  className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-navy/40 transition-colors hover:border-red-200 hover:text-red-500"
                >
                  <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addImageUrl}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gold hover:text-gold-light transition-colors"
          >
            <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Ajouter une photo
          </button>
        </CardContent>
      </Card>

      {/* Publish toggle + Submit */}
      <Card className="border-none bg-white shadow-sm">
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              className={`relative h-6 w-11 rounded-full transition-colors ${
                form.isPublished ? "bg-gold" : "bg-gray-300"
              }`}
              onClick={() => updateField("isPublished", !form.isPublished)}
            >
              <div
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  form.isPublished ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </div>
            <span className="text-sm font-medium text-navy">
              {form.isPublished ? "Publiee" : "Brouillon"}
            </span>
          </label>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-lg border border-navy/20 bg-white px-6 py-2.5 text-sm font-medium text-navy transition-colors hover:bg-cream"
            >
              Annuler
            </button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-navy px-6 py-2.5 text-sm font-semibold text-white hover:bg-navy-light disabled:opacity-50"
              size="lg"
            >
              {loading
                ? "Enregistrement..."
                : mode === "create"
                  ? "Creer l'annonce"
                  : "Enregistrer les modifications"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
