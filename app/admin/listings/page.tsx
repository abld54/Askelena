"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ListingRow {
  id: string;
  title: string;
  type: string;
  location: string;
  pricePerNight: number;
  isPublished: boolean;
}

const typeLabels: Record<string, string> = {
  peniche: "Peniche",
  chateau: "Chateau",
  villa: "Villa",
  appartement: "Appartement",
  treehouse: "Cabane",
  other: "Autre",
};

export default function AdminListings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<ListingRow[]>([]);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((session) => {
        if (!session?.user || session.user.role !== "host") {
          router.push("/");
          return;
        }
        loadListings();
      })
      .catch(() => router.push("/"));
  }, [router]);

  async function loadListings() {
    try {
      const res = await fetch("/api/admin/listings");
      if (res.ok) {
        const data = await res.json();
        setListings(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  async function deleteListing(id: string) {
    if (!confirm("Supprimer ce bien ? Cette action est irreversible.")) return;
    try {
      const res = await fetch(`/api/admin/listings/${id}`, { method: "DELETE" });
      if (res.ok) {
        setListings((prev) => prev.filter((l) => l.id !== id));
      }
    } catch {
      alert("Erreur lors de la suppression.");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center">
        <div className="text-[#0F2044]/50 text-lg">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F4]">
      {/* Top nav */}
      <header className="bg-[#0F2044] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link href="/" className="text-xl font-semibold tracking-wide" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
                Askelena
              </Link>
              <span className="text-[#C9A84C] text-sm">✦</span>
              <span className="text-white/50 text-sm">Administration</span>
            </div>
            <nav className="flex items-center gap-6">
              <Link href="/admin" className="text-white/70 hover:text-[#C9A84C] text-sm font-medium transition-colors">Tableau de bord</Link>
              <Link href="/admin/listings" className="text-[#C9A84C] text-sm font-medium">Biens</Link>
              <Link href="/admin/bookings" className="text-white/70 hover:text-[#C9A84C] text-sm font-medium transition-colors">Reservations</Link>
              <Link href="/" className="text-white/40 hover:text-white/70 text-sm transition-colors">Retour au site</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-semibold text-[#0F2044]" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
            Gestion des biens
          </h1>
          <Link
            href="/admin/listings/new"
            className="inline-flex items-center gap-2 bg-[#C9A84C] text-[#0F2044] px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#E5C158] transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Ajouter un bien
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[#0F2044]/5 overflow-hidden">
          {listings.length === 0 ? (
            <div className="px-6 py-12 text-center text-[#0F2044]/40">
              Aucun bien enregistre. Commencez par en ajouter un !
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#0F2044]/5 text-[#0F2044]/50">
                    <th className="text-left px-6 py-3 font-medium">Titre</th>
                    <th className="text-left px-6 py-3 font-medium">Type</th>
                    <th className="text-left px-6 py-3 font-medium">Ville</th>
                    <th className="text-left px-6 py-3 font-medium">Prix/nuit</th>
                    <th className="text-left px-6 py-3 font-medium">Statut</th>
                    <th className="text-right px-6 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((l) => (
                    <tr key={l.id} className="border-b border-[#0F2044]/5 last:border-0 hover:bg-[#FAF8F4]/50">
                      <td className="px-6 py-3 text-[#0F2044] font-medium">{l.title}</td>
                      <td className="px-6 py-3 text-[#0F2044]/70">{typeLabels[l.type] || l.type}</td>
                      <td className="px-6 py-3 text-[#0F2044]/70">{l.location}</td>
                      <td className="px-6 py-3 text-[#0F2044]/70">{l.pricePerNight} €</td>
                      <td className="px-6 py-3">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${l.isPublished ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                          {l.isPublished ? "Publie" : "Brouillon"}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/listings/${l.id}/edit`}
                            className="inline-flex items-center gap-1 text-[#0F2044] hover:text-[#C9A84C] text-xs font-medium transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            Modifier
                          </Link>
                          <button
                            onClick={() => deleteListing(l.id)}
                            className="inline-flex items-center gap-1 text-red-500 hover:text-red-700 text-xs font-medium transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                            </svg>
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
