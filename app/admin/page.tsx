"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface DashboardStats {
  totalListings: number;
  totalBookings: number;
  pendingBookings: number;
  revenue: number;
}

interface RecentBooking {
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
  confirmed: "Confirmée",
  cancelled: "Annulée",
  completed: "Terminée",
};

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalListings: 0,
    totalBookings: 0,
    pendingBookings: 0,
    revenue: 0,
  });
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((session) => {
        if (!session?.user || session.user.role !== "host") {
          router.push("/");
          return;
        }
        loadDashboard();
      })
      .catch(() => router.push("/"));
  }, [router]);

  async function loadDashboard() {
    try {
      const res = await fetch("/api/admin/dashboard");
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setRecentBookings(data.recentBookings || []);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
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
              <Link
                href="/"
                className="text-xl font-semibold tracking-wide"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
              >
                Askelena
              </Link>
              <span className="text-[#C9A84C] text-sm">✦</span>
              <span className="text-white/50 text-sm">Administration</span>
            </div>
            <nav className="flex items-center gap-6">
              <Link
                href="/admin"
                className="text-[#C9A84C] text-sm font-medium"
              >
                Tableau de bord
              </Link>
              <Link
                href="/admin/listings"
                className="text-white/70 hover:text-[#C9A84C] text-sm font-medium transition-colors"
              >
                Biens
              </Link>
              <Link
                href="/admin/bookings"
                className="text-white/70 hover:text-[#C9A84C] text-sm font-medium transition-colors"
              >
                Reservations
              </Link>
              <Link
                href="/"
                className="text-white/40 hover:text-white/70 text-sm transition-colors"
              >
                Retour au site
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1
          className="text-3xl font-semibold text-[#0F2044] mb-8"
          style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
        >
          Tableau de bord
        </h1>

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#0F2044]/5">
            <div className="text-[#0F2044]/50 text-sm mb-1">Total biens</div>
            <div className="text-3xl font-semibold text-[#0F2044]">
              {stats.totalListings}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#0F2044]/5">
            <div className="text-[#0F2044]/50 text-sm mb-1">
              Total reservations
            </div>
            <div className="text-3xl font-semibold text-[#0F2044]">
              {stats.totalBookings}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#0F2044]/5">
            <div className="text-[#0F2044]/50 text-sm mb-1">En attente</div>
            <div className="text-3xl font-semibold text-[#C9A84C]">
              {stats.pendingBookings}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#0F2044]/5">
            <div className="text-[#0F2044]/50 text-sm mb-1">
              Revenu total
            </div>
            <div className="text-3xl font-semibold text-[#0F2044]">
              {stats.revenue.toLocaleString("fr-FR")} €
            </div>
          </div>
        </div>

        {/* Quick links */}
        <div className="flex flex-wrap gap-4 mb-10">
          <Link
            href="/admin/listings"
            className="inline-flex items-center gap-2 bg-[#0F2044] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#1B3A6B] transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            Gerer les biens
          </Link>
          <Link
            href="/admin/listings/new"
            className="inline-flex items-center gap-2 bg-[#C9A84C] text-[#0F2044] px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#E5C158] transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Ajouter un bien
          </Link>
          <Link
            href="/admin/bookings"
            className="inline-flex items-center gap-2 bg-[#0F2044] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#1B3A6B] transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            Gerer les reservations
          </Link>
        </div>

        {/* Recent bookings */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#0F2044]/5 overflow-hidden">
          <div className="px-6 py-4 border-b border-[#0F2044]/5">
            <h2
              className="text-lg font-semibold text-[#0F2044]"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              Reservations recentes
            </h2>
          </div>
          {recentBookings.length === 0 ? (
            <div className="px-6 py-12 text-center text-[#0F2044]/40">
              Aucune reservation pour le moment.
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
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((b) => (
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
