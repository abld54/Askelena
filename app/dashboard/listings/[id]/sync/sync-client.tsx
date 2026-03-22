"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface CalendarSyncData {
  id: string;
  platform: string;
  icalUrl: string;
  lastSyncAt: string | null;
  lastError: string | null;
  isActive: boolean;
  createdAt: string;
}

interface SyncClientProps {
  listingId: string;
  listingTitle: string;
  initialSyncs: CalendarSyncData[];
  exportUrl: string;
}

const platformLabels: Record<string, string> = {
  airbnb: "Airbnb",
  booking: "Booking.com",
  other: "Autre",
};

const platformColors: Record<string, string> = {
  airbnb: "bg-rose-100 text-rose-700",
  booking: "bg-blue-100 text-blue-700",
  other: "bg-gray-100 text-gray-700",
};

export function SyncClient({ listingId, listingTitle, initialSyncs, exportUrl }: SyncClientProps) {
  const [syncs, setSyncs] = useState<CalendarSyncData[]>(initialSyncs);
  const [icalUrl, setIcalUrl] = useState("");
  const [platform, setPlatform] = useState("airbnb");
  const [isAdding, setIsAdding] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsAdding(true);

    try {
      const res = await fetch(`/api/listings/${listingId}/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ icalUrl, platform }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur lors de l'ajout");
        return;
      }

      // Refresh the list
      await refreshList();
      setIcalUrl("");
      setShowForm(false);
      setSuccess("Calendrier synchronisé avec succès !");
    } catch {
      setError("Erreur de connexion");
    } finally {
      setIsAdding(false);
    }
  }

  async function handleDelete(syncId: string) {
    if (!confirm("Supprimer cette synchronisation ? Les dates bloquées importées seront supprimées.")) {
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/listings/${listingId}/sync/${syncId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erreur lors de la suppression");
        return;
      }

      setSyncs((prev) => prev.filter((s) => s.id !== syncId));
      setSuccess("Synchronisation supprimée");
    } catch {
      setError("Erreur de connexion");
    }
  }

  async function handleRefresh() {
    setError(null);
    setSuccess(null);
    setIsRefreshing(true);

    try {
      const res = await fetch(`/api/listings/${listingId}/sync/refresh`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erreur lors de la synchronisation");
        return;
      }

      await refreshList();
      setSuccess("Calendriers actualisés !");
    } catch {
      setError("Erreur de connexion");
    } finally {
      setIsRefreshing(false);
    }
  }

  async function refreshList() {
    try {
      const res = await fetch(`/api/listings/${listingId}/sync`);
      if (res.ok) {
        const data = await res.json();
        setSyncs(data);
      }
    } catch {
      // silently fail
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(exportUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function formatDate(iso: string | null): string {
    if (!iso) return "Jamais";
    return new Date(iso).toLocaleString("fr-FR", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/listings"
          className="text-navy/60 hover:text-navy transition-colors"
        >
          <svg className="size-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-heading font-bold text-navy">
            Synchronisation calendrier
          </h1>
          <p className="text-sm text-navy/60">{listingTitle}</p>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Export section */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-heading font-semibold text-navy mb-2">
          Exporter vers Airbnb
        </h2>
        <p className="text-sm text-navy/60 mb-4">
          Copiez cette URL et collez-la dans Airbnb pour synchroniser vos disponibilités Askelena.
        </p>

        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={exportUrl}
            className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-navy/80 font-mono"
          />
          <button
            onClick={handleCopy}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-semibold transition-colors whitespace-nowrap",
              copied
                ? "bg-green-600 text-white"
                : "bg-navy text-white hover:bg-navy/90"
            )}
          >
            {copied ? "Copié !" : "Copier"}
          </button>
        </div>

        <div className="mt-4 rounded-lg bg-cream p-4">
          <h3 className="text-sm font-semibold text-navy mb-2">
            Instructions pour Airbnb :
          </h3>
          <ol className="text-sm text-navy/70 space-y-1 list-decimal list-inside">
            <li>Allez sur Airbnb &gt; Votre annonce &gt; Disponibilité &gt; Importer un calendrier</li>
            <li>Collez l'URL ci-dessus</li>
            <li>Nommez le calendrier &quot;Askelena&quot;</li>
            <li>Cliquez sur &quot;Importer le calendrier&quot;</li>
          </ol>
        </div>
      </div>

      {/* Import section */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-heading font-semibold text-navy">
              Importer depuis d'autres plateformes
            </h2>
            <p className="text-sm text-navy/60">
              Importez les calendriers iCal de vos autres plateformes pour bloquer automatiquement les dates.
            </p>
          </div>
          <div className="flex gap-2">
            {syncs.length > 0 && (
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-navy hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {isRefreshing ? (
                  <span className="flex items-center gap-1.5">
                    <svg className="size-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Actualisation...
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
                    </svg>
                    Actualiser
                  </span>
                )}
              </button>
            )}
            <button
              onClick={() => setShowForm(!showForm)}
              className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-navy hover:bg-gold/90 transition-colors"
            >
              {showForm ? "Annuler" : "+ Ajouter un calendrier"}
            </button>
          </div>
        </div>

        {/* Add form */}
        {showForm && (
          <form onSubmit={handleAdd} className="mb-6 rounded-lg border border-gray-200 bg-cream p-4 space-y-4">
            <div>
              <label htmlFor="platform" className="block text-sm font-medium text-navy mb-1">
                Plateforme
              </label>
              <select
                id="platform"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-navy"
              >
                <option value="airbnb">Airbnb</option>
                <option value="booking">Booking.com</option>
                <option value="other">Autre</option>
              </select>
            </div>
            <div>
              <label htmlFor="icalUrl" className="block text-sm font-medium text-navy mb-1">
                URL du calendrier iCal
              </label>
              <input
                id="icalUrl"
                type="url"
                required
                placeholder="https://www.airbnb.com/calendar/ical/123456.ics?s=abc123"
                value={icalUrl}
                onChange={(e) => setIcalUrl(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-navy placeholder:text-navy/40"
              />
              <p className="mt-1 text-xs text-navy/50">
                {platform === "airbnb"
                  ? "Airbnb > Votre annonce > Disponibilité > Exporter le calendrier"
                  : platform === "booking"
                  ? "Booking.com > Propriété > Tarifs et disponibilité > Sync calendrier"
                  : "Trouvez l'URL iCal de votre plateforme"}
              </p>
            </div>
            <button
              type="submit"
              disabled={isAdding}
              className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy/90 transition-colors disabled:opacity-50"
            >
              {isAdding ? "Synchronisation en cours..." : "Ajouter et synchroniser"}
            </button>
          </form>
        )}

        {/* Sync list */}
        {syncs.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
            <svg className="mx-auto size-10 text-navy/20 mb-3" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
            <p className="text-sm text-navy/50">
              Aucun calendrier externe synchronisé
            </p>
            <p className="text-xs text-navy/40 mt-1">
              Ajoutez un calendrier iCal pour synchroniser vos disponibilités
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {syncs.map((sync) => (
              <div
                key={sync.id}
                className="flex items-start justify-between gap-4 rounded-lg border border-gray-200 p-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                        platformColors[sync.platform] || platformColors.other
                      )}
                    >
                      {platformLabels[sync.platform] || sync.platform}
                    </span>
                    {sync.lastError && (
                      <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                        Erreur
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-navy/50 font-mono truncate" title={sync.icalUrl}>
                    {sync.icalUrl}
                  </p>
                  <div className="mt-1 flex items-center gap-3 text-xs text-navy/40">
                    <span>Dernière sync : {formatDate(sync.lastSyncAt)}</span>
                    <span>Ajouté le {formatDate(sync.createdAt)}</span>
                  </div>
                  {sync.lastError && (
                    <p className="mt-1 text-xs text-red-600">
                      {sync.lastError}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(sync.id)}
                  className="shrink-0 rounded-lg border border-gray-300 p-2 text-navy/40 hover:text-red-600 hover:border-red-300 transition-colors"
                  title="Supprimer"
                >
                  <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instructions for Booking.com */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-heading font-semibold text-navy mb-2">
          Comment synchroniser ?
        </h2>
        <div className="space-y-4 text-sm text-navy/70">
          <div>
            <h3 className="font-semibold text-navy mb-1">Airbnb</h3>
            <ol className="list-decimal list-inside space-y-0.5">
              <li>Allez sur votre annonce Airbnb &gt; Disponibilité &gt; Exporter le calendrier</li>
              <li>Copiez le lien iCal</li>
              <li>Collez-le ci-dessus en sélectionnant &quot;Airbnb&quot;</li>
            </ol>
          </div>
          <div>
            <h3 className="font-semibold text-navy mb-1">Booking.com</h3>
            <ol className="list-decimal list-inside space-y-0.5">
              <li>Allez sur l'extranet Booking.com &gt; Tarifs et disponibilité &gt; Sync calendrier</li>
              <li>Copiez le lien iCal d'export</li>
              <li>Collez-le ci-dessus en sélectionnant &quot;Booking.com&quot;</li>
            </ol>
          </div>
          <p className="text-xs text-navy/40 mt-2">
            La synchronisation est automatique. Vous pouvez forcer une actualisation à tout moment.
          </p>
        </div>
      </div>
    </div>
  );
}
