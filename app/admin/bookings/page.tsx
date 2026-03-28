"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface BookingRow {
  id: string;
  guestName: string;
  guestEmail: string;
  listingTitle: string;
  startDate: string;
  endDate: string;
  nights: number;
  totalPrice: number;
  status: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  completed: "bg-blue-100 text-blue-800",
};

const statusLabels: Record<string, string> = {
  pending: "En attente",
  confirmed: "Confirmee",
  cancelled: "Annulee",
  completed: "Terminee",
};

const statusFilters = [
  { value: "", label: "Toutes" },
  { value: "pending", label: "En attente" },
  { value: "confirmed", label: "Confirmees" },
  { value: "cancelled", label: "Annulees" },
  { value: "completed", label: "Terminees" },
];

export default function AdminBookings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((session) => {
        if (!session?.user || session.user.role !== "host") {
          router.push("/");
          return;
        }
        loadBookings();
      })
      .catch(() => router.push("/"));
  }, [router]);

  async function loadBookings() {
    try {
      const res = await fetch("/api/admin/bookings");
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(bookingId: string, status: string) {
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status } : b))
        );
      }
    } catch {
      alert("Erreur lors de la mise a jour.");
    }
  }

  const filtered = filter ? bookings.filter((b) => b.status === filter) : bookings;

  if (loading) {
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
              <Link href="/admin/listings" className="text-white/70 hover:text-[#C9A84C] text-sm font-medium transition-colors">Biens</Link>
              <Link href="/admin/bookings" className="text-[#C9A84C] text-sm font-medium">Reservations</Link>
              <Link href="/" className="text-white/40 hover:text-white/70 text-sm transition-colors">Retour au site</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-semibold text-[#0F2044]" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
            Gestion des reservations
          </h1>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {statusFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === f.value
                  ? "bg-[#0F2044] text-white"
                  : "bg-white text-[#0F2044]/60 hover:bg-[#0F2044]/5 border border-[#0F2044]/10"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[#0F2044]/5 overflow-hidden">
          {filtered.length === 0 ? (
            <div className="px-6 py-12 text-center text-[#0F2044]/40">
              Aucune reservation {filter ? statusLabels[filter]?.toLowerCase() : ""}.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#0F2044]/5 text-[#0F2044]/50">
                    <th className="text-left px-6 py-3 font-medium">Client</th>
                    <th className="text-left px-6 py-3 font-medium">Bien</th>
                    <th className="text-left px-6 py-3 font-medium">Dates</th>
                    <th className="text-left px-6 py-3 font-medium">Nuits</th>
                    <th className="text-left px-6 py-3 font-medium">Total</th>
                    <th className="text-left px-6 py-3 font-medium">Statut</th>
                    <th className="text-right px-6 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((b) => (
                    <tr key={b.id} className="border-b border-[#0F2044]/5 last:border-0 hover:bg-[#FAF8F4]/50">
                      <td className="px-6 py-3 text-[#0F2044]">
                        <div className="font-medium">{b.guestName}</div>
                        <div className="text-[#0F2044]/40 text-xs">{b.guestEmail}</div>
                      </td>
                      <td className="px-6 py-3 text-[#0F2044]/70">{b.listingTitle}</td>
                      <td className="px-6 py-3 text-[#0F2044]/70">
                        {new Date(b.startDate).toLocaleDateString("fr-FR")} - {new Date(b.endDate).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-6 py-3 text-[#0F2044]/70">{b.nights}</td>
                      <td className="px-6 py-3 text-[#0F2044] font-medium">{b.totalPrice.toLocaleString("fr-FR")} €</td>
                      <td className="px-6 py-3">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[b.status] || "bg-gray-100 text-gray-800"}`}>
                          {statusLabels[b.status] || b.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {b.status === "pending" && (
                            <>
                              <button
                                onClick={() => updateStatus(b.id, "confirmed")}
                                className="text-green-600 hover:text-green-800 text-xs font-medium transition-colors"
                              >
                                Confirmer
                              </button>
                              <button
                                onClick={() => updateStatus(b.id, "cancelled")}
                                className="text-red-500 hover:text-red-700 text-xs font-medium transition-colors"
                              >
                                Annuler
                              </button>
                            </>
                          )}
                          {b.status === "confirmed" && (
                            <button
                              onClick={() => updateStatus(b.id, "cancelled")}
                              className="text-red-500 hover:text-red-700 text-xs font-medium transition-colors"
                            >
                              Annuler
                            </button>
                          )}
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
