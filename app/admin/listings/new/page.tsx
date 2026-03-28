"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const listingTypes = [
  { value: "peniche", label: "Peniche" },
  { value: "appartement", label: "Appartement" },
  { value: "chateau", label: "Chateau" },
  { value: "villa", label: "Villa" },
  { value: "treehouse", label: "Cabane" },
  { value: "other", label: "Autre" },
];

interface FormData {
  title: string;
  description: string;
  type: string;
  location: string;
  address: string;
  latitude: string;
  longitude: string;
  pricePerNight: string;
  pricePerWeek: string;
  pricePerMonth: string;
  capacity: string;
  bedrooms: string;
  bathrooms: string;
  amenities: string;
  airbnbUrl: string;
  isPublished: boolean;
}

const emptyForm: FormData = {
  title: "",
  description: "",
  type: "peniche",
  location: "",
  address: "",
  latitude: "",
  longitude: "",
  pricePerNight: "",
  pricePerWeek: "",
  pricePerMonth: "",
  capacity: "",
  bedrooms: "",
  bathrooms: "",
  amenities: "",
  airbnbUrl: "",
  isPublished: false,
};

export default function NewListing() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [error, setError] = useState("");
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((session) => {
        if (!session?.user || session.user.role !== "host") {
          router.push("/");
          return;
        }
        setAuthed(true);
      })
      .catch(() => router.push("/"));
  }, [router]);

  function updateField(field: keyof FormData, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleScrape() {
    if (!form.airbnbUrl) return;
    setScraping(true);
    setError("");
    try {
      const res = await fetch("/api/admin/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: form.airbnbUrl }),
      });
      if (!res.ok) throw new Error("Erreur lors du scraping");
      const data = await res.json();
      setForm((prev) => ({
        ...prev,
        title: data.title || prev.title,
        description: data.description || prev.description,
        pricePerNight: data.pricePerNight ? String(data.pricePerNight) : prev.pricePerNight,
        capacity: data.capacity ? String(data.capacity) : prev.capacity,
        bedrooms: data.bedrooms ? String(data.bedrooms) : prev.bedrooms,
        bathrooms: data.bathrooms ? String(data.bathrooms) : prev.bathrooms,
        amenities: data.amenities ? data.amenities.join(", ") : prev.amenities,
        latitude: data.lat ? String(data.lat) : prev.latitude,
        longitude: data.lng ? String(data.lng) : prev.longitude,
        location: data.city || prev.location,
      }));
    } catch {
      setError("Impossible d'importer depuis Airbnb. Verifiez l'URL.");
    } finally {
      setScraping(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const amenitiesArray = form.amenities
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean);

      const body = {
        title: form.title,
        description: form.description,
        type: form.type,
        location: form.location,
        address: form.address || null,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
        pricePerNight: parseFloat(form.pricePerNight) || 0,
        capacity: parseInt(form.capacity) || 1,
        amenities: JSON.stringify(amenitiesArray),
        airbnbUrl: form.airbnbUrl || null,
        isPublished: form.isPublished,
      };

      const res = await fetch("/api/admin/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erreur lors de la sauvegarde");
      }

      router.push("/admin/listings");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setSaving(false);
    }
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center">
        <div className="text-[#0F2044]/50 text-lg">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F4]">
      <header className="bg-[#0F2044] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link href="/" className="text-xl font-semibold tracking-wide" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>Askelena</Link>
              <span className="text-[#C9A84C] text-sm">✦</span>
              <span className="text-white/50 text-sm">Administration</span>
            </div>
            <nav className="flex items-center gap-6">
              <Link href="/admin" className="text-white/70 hover:text-[#C9A84C] text-sm font-medium transition-colors">Tableau de bord</Link>
              <Link href="/admin/listings" className="text-[#C9A84C] text-sm font-medium">Biens</Link>
              <Link href="/admin/bookings" className="text-white/70 hover:text-[#C9A84C] text-sm font-medium transition-colors">Reservations</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/admin/listings" className="text-[#0F2044]/40 hover:text-[#0F2044] transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-3xl font-semibold text-[#0F2044]" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
            Ajouter un bien
          </h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Airbnb import */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#0F2044]/5">
            <h2 className="text-lg font-semibold text-[#0F2044] mb-4" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
              Importer depuis Airbnb
            </h2>
            <div className="flex gap-3">
              <input
                type="url"
                value={form.airbnbUrl}
                onChange={(e) => updateField("airbnbUrl", e.target.value)}
                placeholder="https://www.airbnb.fr/rooms/..."
                className="flex-1 h-10 rounded-lg border border-[#0F2044]/10 bg-white px-3 text-sm text-[#0F2044] placeholder:text-[#0F2044]/30 focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/50"
              />
              {form.airbnbUrl && (
                <button
                  type="button"
                  onClick={handleScrape}
                  disabled={scraping}
                  className="inline-flex items-center gap-2 bg-[#0F2044] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#1B3A6B] transition-colors disabled:opacity-50"
                >
                  {scraping ? "Import en cours..." : "Importer depuis Airbnb"}
                </button>
              )}
            </div>
          </div>

          {/* Basic info */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#0F2044]/5">
            <h2 className="text-lg font-semibold text-[#0F2044] mb-4" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
              Informations generales
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#0F2044]/70 mb-1">Titre</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  className="w-full h-10 rounded-lg border border-[#0F2044]/10 bg-white px-3 text-sm text-[#0F2044] focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/50"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#0F2044]/70 mb-1">Description</label>
                <textarea
                  required
                  rows={4}
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  className="w-full rounded-lg border border-[#0F2044]/10 bg-white px-3 py-2 text-sm text-[#0F2044] focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F2044]/70 mb-1">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => updateField("type", e.target.value)}
                  className="w-full h-10 rounded-lg border border-[#0F2044]/10 bg-white px-3 text-sm text-[#0F2044] focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/50"
                >
                  {listingTypes.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F2044]/70 mb-1">Ville / Region</label>
                <input
                  type="text"
                  required
                  value={form.location}
                  onChange={(e) => updateField("location", e.target.value)}
                  className="w-full h-10 rounded-lg border border-[#0F2044]/10 bg-white px-3 text-sm text-[#0F2044] focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/50"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#0F2044]/70 mb-1">Adresse</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  className="w-full h-10 rounded-lg border border-[#0F2044]/10 bg-white px-3 text-sm text-[#0F2044] focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F2044]/70 mb-1">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={form.latitude}
                  onChange={(e) => updateField("latitude", e.target.value)}
                  className="w-full h-10 rounded-lg border border-[#0F2044]/10 bg-white px-3 text-sm text-[#0F2044] focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F2044]/70 mb-1">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={form.longitude}
                  onChange={(e) => updateField("longitude", e.target.value)}
                  className="w-full h-10 rounded-lg border border-[#0F2044]/10 bg-white px-3 text-sm text-[#0F2044] focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/50"
                />
              </div>
            </div>
          </div>

          {/* Pricing & capacity */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#0F2044]/5">
            <h2 className="text-lg font-semibold text-[#0F2044] mb-4" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
              Tarifs et capacite
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#0F2044]/70 mb-1">Prix / nuit (€)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={form.pricePerNight}
                  onChange={(e) => updateField("pricePerNight", e.target.value)}
                  className="w-full h-10 rounded-lg border border-[#0F2044]/10 bg-white px-3 text-sm text-[#0F2044] focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F2044]/70 mb-1">Prix / semaine (€)</label>
                <input
                  type="number"
                  min="0"
                  value={form.pricePerWeek}
                  onChange={(e) => updateField("pricePerWeek", e.target.value)}
                  className="w-full h-10 rounded-lg border border-[#0F2044]/10 bg-white px-3 text-sm text-[#0F2044] focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F2044]/70 mb-1">Prix / mois (€)</label>
                <input
                  type="number"
                  min="0"
                  value={form.pricePerMonth}
                  onChange={(e) => updateField("pricePerMonth", e.target.value)}
                  className="w-full h-10 rounded-lg border border-[#0F2044]/10 bg-white px-3 text-sm text-[#0F2044] focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F2044]/70 mb-1">Capacite (voyageurs)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={form.capacity}
                  onChange={(e) => updateField("capacity", e.target.value)}
                  className="w-full h-10 rounded-lg border border-[#0F2044]/10 bg-white px-3 text-sm text-[#0F2044] focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F2044]/70 mb-1">Chambres</label>
                <input
                  type="number"
                  min="0"
                  value={form.bedrooms}
                  onChange={(e) => updateField("bedrooms", e.target.value)}
                  className="w-full h-10 rounded-lg border border-[#0F2044]/10 bg-white px-3 text-sm text-[#0F2044] focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F2044]/70 mb-1">Salles de bain</label>
                <input
                  type="number"
                  min="0"
                  value={form.bathrooms}
                  onChange={(e) => updateField("bathrooms", e.target.value)}
                  className="w-full h-10 rounded-lg border border-[#0F2044]/10 bg-white px-3 text-sm text-[#0F2044] focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/50"
                />
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#0F2044]/5">
            <h2 className="text-lg font-semibold text-[#0F2044] mb-4" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
              Equipements
            </h2>
            <div>
              <label className="block text-sm font-medium text-[#0F2044]/70 mb-1">
                Equipements (separes par des virgules)
              </label>
              <input
                type="text"
                value={form.amenities}
                onChange={(e) => updateField("amenities", e.target.value)}
                placeholder="WiFi, Parking, Climatisation, Cuisine equipee..."
                className="w-full h-10 rounded-lg border border-[#0F2044]/10 bg-white px-3 text-sm text-[#0F2044] placeholder:text-[#0F2044]/30 focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/50"
              />
            </div>
          </div>

          {/* Publish & Save */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#0F2044]/5">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(e) => updateField("isPublished", e.target.checked)}
                  className="w-4 h-4 rounded border-[#0F2044]/20 text-[#C9A84C] focus:ring-[#C9A84C]"
                />
                <span className="text-sm font-medium text-[#0F2044]">Publier immediatement</span>
              </label>
              <div className="flex gap-3">
                <Link
                  href="/admin/listings"
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-[#0F2044]/60 hover:text-[#0F2044] border border-[#0F2044]/10 hover:border-[#0F2044]/20 transition-colors"
                >
                  Annuler
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#C9A84C] text-[#0F2044] px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#E5C158] transition-colors disabled:opacity-50"
                >
                  {saving ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
