"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

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
  capacity: string;
  amenities: string;
  airbnbUrl: string;
  isPublished: boolean;
}

interface ImageRow {
  id: string;
  url: string;
  alt: string;
  order: number;
}

interface CalendarSyncRow {
  id: string;
  platform: string;
  icalUrl: string;
  lastSyncAt: string | null;
  isActive: boolean;
}

interface BlockedDateRow {
  id: string;
  date: string;
  source: string;
}

export default function EditClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id") as string;

  const [form, setForm] = useState<FormData>({
    title: "",
    description: "",
    type: "peniche",
    location: "",
    address: "",
    latitude: "",
    longitude: "",
    pricePerNight: "",
    capacity: "",
    amenities: "",
    airbnbUrl: "",
    isPublished: false,
  });

  const [images, setImages] = useState<ImageRow[]>([]);
  const [calendarSyncs, setCalendarSyncs] = useState<CalendarSyncRow[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDateRow[]>([]);

  const [newImageUrl, setNewImageUrl] = useState("");
  const [newImageAlt, setNewImageAlt] = useState("");
  const [newIcalUrl, setNewIcalUrl] = useState("");
  const [newIcalPlatform, setNewIcalPlatform] = useState("airbnb");
  const [newBlockedDate, setNewBlockedDate] = useState("");

  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadListing = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/listings/${id}`);
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();

      let amenitiesStr = "";
      try {
        const arr = JSON.parse(data.amenities || "[]");
        amenitiesStr = Array.isArray(arr) ? arr.join(", ") : "";
      } catch {
        amenitiesStr = data.amenities || "";
      }

      setForm({
        title: data.title || "",
        description: data.description || "",
        type: data.type || "peniche",
        location: data.location || "",
        address: data.address || "",
        latitude: data.latitude != null ? String(data.latitude) : "",
        longitude: data.longitude != null ? String(data.longitude) : "",
        pricePerNight: data.pricePerNight != null ? String(data.pricePerNight) : "",
        capacity: data.capacity != null ? String(data.capacity) : "",
        amenities: amenitiesStr,
        airbnbUrl: data.airbnbUrl || "",
        isPublished: data.isPublished || false,
      });
      setImages(data.images || []);
      setCalendarSyncs(data.calendarSyncs || []);
      setBlockedDates(data.blockedDates || []);
    } catch {
      setError("Impossible de charger le bien.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((session) => {
        if (!session?.user || session.user.role !== "host") {
          router.push("/");
          return;
        }
        loadListing();
      })
      .catch(() => router.push("/"));
  }, [router, loadListing]);

  function updateField(field: keyof FormData, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const amenitiesArray = form.amenities.split(",").map((a) => a.trim()).filter(Boolean);
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

      const res = await fetch(`/api/admin/listings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erreur lors de la sauvegarde");
      }

      setSuccess("Bien mis a jour avec succes !");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setSaving(false);
    }
  }

  async function addImage() {
    if (!newImageUrl) return;
    try {
      const res = await fetch(`/api/admin/listings/${id}/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: newImageUrl, alt: newImageAlt }),
      });
      if (res.ok) {
        const img = await res.json();
        setImages((prev) => [...prev, img]);
        setNewImageUrl("");
        setNewImageAlt("");
      }
    } catch {
      setError("Erreur lors de l'ajout de l'image.");
    }
  }

  async function deleteImage(imageId: string) {
    try {
      await fetch(`/api/admin/listings/${id}/images/${imageId}`, { method: "DELETE" });
      setImages((prev) => prev.filter((i) => i.id !== imageId));
    } catch {
      // silently fail
    }
  }

  async function addCalendarSync() {
    if (!newIcalUrl) return;
    try {
      const res = await fetch(`/api/admin/listings/${id}/calendar-syncs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ icalUrl: newIcalUrl, platform: newIcalPlatform }),
      });
      if (res.ok) {
        const sync = await res.json();
        setCalendarSyncs((prev) => [...prev, sync]);
        setNewIcalUrl("");
      }
    } catch {
      setError("Erreur lors de l'ajout de la synchro calendrier.");
    }
  }

  async function deleteCalendarSync(syncId: string) {
    try {
      await fetch(`/api/admin/listings/${id}/calendar-syncs/${syncId}`, { method: "DELETE" });
      setCalendarSyncs((prev) => prev.filter((s) => s.id !== syncId));
    } catch {
      // silently fail
    }
  }

  async function addBlockedDate() {
    if (!newBlockedDate) return;
    try {
      const res = await fetch(`/api/admin/listings/${id}/blocked-dates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: newBlockedDate }),
      });
      if (res.ok) {
        const bd = await res.json();
        setBlockedDates((prev) => [...prev, bd]);
        setNewBlockedDate("");
      }
    } catch {
      setError("Erreur lors de l'ajout de la date bloquee.");
    }
  }

  async function deleteBlockedDate(bdId: string) {
    try {
      await fetch(`/api/admin/listings/${id}/blocked-dates/${bdId}`, { method: "DELETE" });
      setBlockedDates((prev) => prev.filter((d) => d.id !== bdId));
    } catch {
      // silently fail
    }
  }

  async function syncIcalUrl() {
    if (!newIcalUrl) return;
    setSyncing(true);
    setSyncResult("");
    try {
      const res = await fetch(`/api/calendar/sync/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: newIcalUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur de synchronisation");
      setSyncResult(`Synchronise : ${data.eventsFound} evenements, ${data.datesBlocked} dates bloquees`);
      setNewIcalUrl("");
      setTimeout(() => setSyncResult(""), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de synchronisation");
    } finally {
      setSyncing(false);
    }
  }

  function copyExportUrl() {
    const url = `${window.location.origin}/api/calendar/export/${id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center">
        <div className="text-[#0F2044]/50 text-lg">Chargement...</div>
      </div>
    );
  }

  const inputClass = "w-full h-10 rounded-lg border border-[#0F2044]/10 bg-white px-3 text-sm text-[#0F2044] focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/50";

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
            Modifier le bien
          </h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">{error}</div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6 text-sm">{success}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic info */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#0F2044]/5">
            <h2 className="text-lg font-semibold text-[#0F2044] mb-4" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
              Informations generales
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#0F2044]/70 mb-1">Titre</label>
                <input type="text" required value={form.title} onChange={(e) => updateField("title", e.target.value)} className={inputClass} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#0F2044]/70 mb-1">Description</label>
                <textarea required rows={4} value={form.description} onChange={(e) => updateField("description", e.target.value)} className="w-full rounded-lg border border-[#0F2044]/10 bg-white px-3 py-2 text-sm text-[#0F2044] focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F2044]/70 mb-1">Type</label>
                <select value={form.type} onChange={(e) => updateField("type", e.target.value)} className={inputClass}>
                  {listingTypes.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F2044]/70 mb-1">Ville / Region</label>
                <input type="text" required value={form.location} onChange={(e) => updateField("location", e.target.value)} className={inputClass} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#0F2044]/70 mb-1">Adresse</label>
                <input type="text" value={form.address} onChange={(e) => updateField("address", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F2044]/70 mb-1">Latitude</label>
                <input type="number" step="any" value={form.latitude} onChange={(e) => updateField("latitude", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F2044]/70 mb-1">Longitude</label>
                <input type="number" step="any" value={form.longitude} onChange={(e) => updateField("longitude", e.target.value)} className={inputClass} />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#0F2044]/5">
            <h2 className="text-lg font-semibold text-[#0F2044] mb-4" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
              Tarifs et capacite
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#0F2044]/70 mb-1">Prix / nuit (€)</label>
                <input type="number" required min="0" value={form.pricePerNight} onChange={(e) => updateField("pricePerNight", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F2044]/70 mb-1">Capacite</label>
                <input type="number" required min="1" value={form.capacity} onChange={(e) => updateField("capacity", e.target.value)} className={inputClass} />
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#0F2044]/5">
            <h2 className="text-lg font-semibold text-[#0F2044] mb-4" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>Equipements</h2>
            <input type="text" value={form.amenities} onChange={(e) => updateField("amenities", e.target.value)} placeholder="WiFi, Parking, Climatisation..." className={inputClass} />
          </div>

          {/* Airbnb URL */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#0F2044]/5">
            <h2 className="text-lg font-semibold text-[#0F2044] mb-4" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>Lien Airbnb</h2>
            <input type="url" value={form.airbnbUrl} onChange={(e) => updateField("airbnbUrl", e.target.value)} placeholder="https://www.airbnb.fr/rooms/..." className={inputClass} />
          </div>

          {/* Publish & Save */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#0F2044]/5">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.isPublished} onChange={(e) => updateField("isPublished", e.target.checked)} className="w-4 h-4 rounded border-[#0F2044]/20 text-[#C9A84C] focus:ring-[#C9A84C]" />
                <span className="text-sm font-medium text-[#0F2044]">Publie</span>
              </label>
              <div className="flex gap-3">
                <Link href="/admin/listings" className="px-5 py-2.5 rounded-xl text-sm font-medium text-[#0F2044]/60 hover:text-[#0F2044] border border-[#0F2044]/10 hover:border-[#0F2044]/20 transition-colors">Annuler</Link>
                <button type="submit" disabled={saving} className="bg-[#C9A84C] text-[#0F2044] px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#E5C158] transition-colors disabled:opacity-50">
                  {saving ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Images management */}
        <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm border border-[#0F2044]/5">
          <h2 className="text-lg font-semibold text-[#0F2044] mb-4" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>Images</h2>
          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {images.map((img) => (
                <div key={img.id} className="relative group rounded-lg overflow-hidden border border-[#0F2044]/5">
                  <img src={img.url} alt={img.alt} className="w-full h-24 object-cover" />
                  <button
                    onClick={() => deleteImage(img.id)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input type="url" value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} placeholder="URL de l'image" className={`flex-1 ${inputClass}`} />
            <input type="text" value={newImageAlt} onChange={(e) => setNewImageAlt(e.target.value)} placeholder="Alt text" className={`w-40 ${inputClass}`} />
            <button type="button" onClick={addImage} className="bg-[#0F2044] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#1B3A6B] transition-colors">Ajouter</button>
          </div>
        </div>

        {/* Blocked dates */}
        <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm border border-[#0F2044]/5">
          <h2 className="text-lg font-semibold text-[#0F2044] mb-4" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>Dates bloquees</h2>
          {blockedDates.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {blockedDates.map((bd) => (
                <span key={bd.id} className="inline-flex items-center gap-1 bg-[#FAF8F4] border border-[#0F2044]/10 rounded-full px-3 py-1 text-xs text-[#0F2044]">
                  {new Date(bd.date).toLocaleDateString("fr-FR")}
                  <span className="text-[#0F2044]/30 text-[10px]">({bd.source})</span>
                  <button onClick={() => deleteBlockedDate(bd.id)} className="text-red-400 hover:text-red-600 ml-1">×</button>
                </span>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input type="date" value={newBlockedDate} onChange={(e) => setNewBlockedDate(e.target.value)} className={inputClass} />
            <button type="button" onClick={addBlockedDate} className="bg-[#0F2044] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#1B3A6B] transition-colors whitespace-nowrap">Bloquer cette date</button>
          </div>
        </div>

        {/* Calendar sync */}
        <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm border border-[#0F2044]/5">
          <h2 className="text-lg font-semibold text-[#0F2044] mb-4" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>Synchronisation calendrier (iCal)</h2>
          {calendarSyncs.length > 0 && (
            <div className="space-y-2 mb-4">
              {calendarSyncs.map((sync) => (
                <div key={sync.id} className="flex items-center justify-between bg-[#FAF8F4] rounded-lg px-4 py-2 text-sm">
                  <div>
                    <span className="font-medium text-[#0F2044] capitalize">{sync.platform}</span>
                    <span className="text-[#0F2044]/40 ml-2 text-xs truncate max-w-xs inline-block align-bottom">{sync.icalUrl}</span>
                    {sync.lastSyncAt && <span className="text-[#0F2044]/30 ml-2 text-xs">Derniere synchro: {new Date(sync.lastSyncAt).toLocaleDateString("fr-FR")}</span>}
                  </div>
                  <button onClick={() => deleteCalendarSync(sync.id)} className="text-red-400 hover:text-red-600 text-xs">Supprimer</button>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <select value={newIcalPlatform} onChange={(e) => setNewIcalPlatform(e.target.value)} className={`w-32 ${inputClass}`}>
              <option value="airbnb">Airbnb</option>
              <option value="booking">Booking</option>
              <option value="other">Autre</option>
            </select>
            <input type="url" value={newIcalUrl} onChange={(e) => setNewIcalUrl(e.target.value)} placeholder="URL iCal" className={`flex-1 ${inputClass}`} />
            <button type="button" onClick={addCalendarSync} className="bg-[#0F2044] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#1B3A6B] transition-colors whitespace-nowrap">Ajouter</button>
          </div>
        </div>

        {/* Calendriers externes */}
        <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm border border-[#0F2044]/5">
          <h2 className="text-lg font-semibold text-[#0F2044] mb-4" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>Calendriers externes</h2>

          {/* Export iCal */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[#0F2044]/70 mb-2">Lien d&apos;export iCal (a partager avec Airbnb, Booking...)</label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={typeof window !== "undefined" ? `${window.location.origin}/api/calendar/export/${id}` : `/api/calendar/export/${id}`}
                className={`flex-1 ${inputClass} bg-[#FAF8F4] text-[#0F2044]/60`}
              />
              <button
                type="button"
                onClick={copyExportUrl}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${copied ? "bg-green-600 text-white" : "bg-[#C9A84C] text-[#0F2044] hover:bg-[#E5C158]"}`}
              >
                {copied ? "Copie !" : "Copier"}
              </button>
            </div>
          </div>

          {/* Import iCal Airbnb */}
          <div>
            <label className="block text-sm font-medium text-[#0F2044]/70 mb-2">Importer un calendrier iCal (Airbnb, Booking...)</label>
            {syncResult && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg mb-3 text-sm">{syncResult}</div>
            )}
            <div className="flex gap-2">
              <input
                type="url"
                value={newIcalUrl}
                onChange={(e) => setNewIcalUrl(e.target.value)}
                placeholder="https://www.airbnb.fr/calendar/ical/..."
                className={`flex-1 ${inputClass}`}
              />
              <button
                type="button"
                onClick={syncIcalUrl}
                disabled={syncing || !newIcalUrl}
                className="bg-[#0F2044] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#1B3A6B] transition-colors whitespace-nowrap disabled:opacity-50"
              >
                {syncing ? "Synchronisation..." : "Synchroniser"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
