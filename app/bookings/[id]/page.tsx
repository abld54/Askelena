"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";

type Booking = {
  id: string;
  status: string;
  startDate: string;
  endDate: string;
  nights: number;
  totalPrice: number;
  guestName: string;
  guestEmail: string;
  specialRequests: string | null;
  confirmedAt: string | null;
  cancelledAt: string | null;
  stripePaymentIntentId: string | null;
  listing: {
    id: string;
    title: string;
    location: string;
    images: { url: string; alt: string }[];
    host: { id: string; name: string | null; email: string; image: string | null };
  };
  guest: { id: string; name: string | null; email: string; image: string | null };
};

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente de paiement",
  confirmed: "Confirmée",
  cancelled: "Annulée",
  completed: "Terminée",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  confirmed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  completed: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
};

function BookingDetailContent() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const paymentSuccess = searchParams.get("payment") === "success";

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchBooking = useCallback(async () => {
    try {
      const res = await fetch(`/api/bookings/${id}`);
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Réservation introuvable");
        return;
      }
      setBooking(await res.json());
    } catch {
      setError("Impossible de charger la réservation.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  async function handleCancel() {
    if (!confirm("Confirmer l'annulation de cette réservation ?")) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });
      if (!res.ok) {
        const d = await res.json();
        alert(d.error ?? "Erreur lors de l'annulation");
        return;
      }
      await fetchBooking();
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-12 px-4">
        <div className="max-w-lg mx-auto animate-pulse space-y-4">
          <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2" />
          <div className="h-40 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
          <div className="h-32 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
        </div>
      </main>
    );
  }

  if (error || !booking) {
    return (
      <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-500 mb-4">{error ?? "Réservation introuvable"}</p>
          <Link href="/bookings" className="underline underline-offset-4 text-sm">
            Retour à mes réservations
          </Link>
        </div>
      </main>
    );
  }

  const img = booking.listing.images[0];
  const canCancel = ["pending", "confirmed"].includes(booking.status);

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-12 px-4">
      <div className="max-w-lg mx-auto space-y-6">
        {paymentSuccess && booking.status === "confirmed" && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 text-green-800 dark:text-green-300">
            <p className="font-semibold">Paiement confirmé !</p>
            <p className="text-sm mt-1">Un email de confirmation vous a été envoyé.</p>
          </div>
        )}

        {paymentSuccess && booking.status === "pending" && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 text-yellow-800 dark:text-yellow-300">
            <p className="font-semibold">Paiement en cours de traitement…</p>
            <p className="text-sm mt-1">Votre réservation sera confirmée dans quelques instants.</p>
          </div>
        )}

        {/* Header */}
        <div className="flex items-start gap-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5">
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={img.url} alt={img.alt || booking.listing.title} className="w-20 h-20 object-cover rounded-lg shrink-0" />
          ) : (
            <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-lg shrink-0" />
          )}
          <div>
            <Link href={`/listings/${booking.listing.id}`} className="font-semibold hover:underline">
              {booking.listing.title}
            </Link>
            <p className="text-sm text-zinc-500">{booking.listing.location}</p>
            <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[booking.status]}`}>
              {STATUS_LABELS[booking.status] ?? booking.status}
            </span>
          </div>
        </div>

        {/* Dates & price */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-zinc-500">Arrivée</span>
            <span className="font-medium">{format(new Date(booking.startDate), "EEEE d MMMM yyyy", { locale: fr })}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Départ</span>
            <span className="font-medium">{format(new Date(booking.endDate), "EEEE d MMMM yyyy", { locale: fr })}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Durée</span>
            <span>{booking.nights} nuit{booking.nights > 1 ? "s" : ""}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800 font-semibold">
            <span>Total payé</span>
            <span>{booking.totalPrice.toFixed(2)} €</span>
          </div>
        </div>

        {/* Special requests */}
        {booking.specialRequests && (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Demandes spéciales</p>
            <p className="text-sm">{booking.specialRequests}</p>
          </div>
        )}

        {/* Host info */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5">
          <p className="text-xs text-zinc-500 uppercase tracking-wide mb-3">Hôte</p>
          <div className="flex items-center gap-3">
            {booking.listing.host.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={booking.listing.host.image} alt="" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-sm font-semibold">
                {(booking.listing.host.name ?? booking.listing.host.email)[0].toUpperCase()}
              </div>
            )}
            <span className="font-medium">{booking.listing.host.name ?? booking.listing.host.email}</span>
          </div>
        </div>

        {/* Actions */}
        {canCancel && (
          <Button
            variant="destructive"
            className="w-full"
            disabled={cancelling}
            onClick={handleCancel}
          >
            {cancelling ? "Annulation…" : "Annuler la réservation"}
          </Button>
        )}

        <div className="text-center">
          <Link href="/bookings" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 underline underline-offset-4">
            ← Toutes mes réservations
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function BookingDetailPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-12 px-4">
        <div className="max-w-lg mx-auto animate-pulse space-y-4">
          <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2" />
          <div className="h-40 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
        </div>
      </main>
    }>
      <BookingDetailContent />
    </Suspense>
  );
}
