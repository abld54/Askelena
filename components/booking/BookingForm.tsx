"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { format, differenceInCalendarDays, eachDayOfInterval, startOfDay, addDays } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  listingId: string;
  pricePerNight: number;
  unavailableDates: string[]; // ISO date strings "YYYY-MM-DD"
  listingTitle: string;
};

const SERVICE_FEE_RATE = 0.12;

function toDateKey(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

function isUnavailable(date: Date, unavailable: Set<string>): boolean {
  return unavailable.has(toDateKey(date));
}

export function BookingForm({ listingId, pricePerNight, unavailableDates, listingTitle }: Props) {
  const router = useRouter();
  const unavailableSet = new Set(unavailableDates);

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [specialRequests, setSpecialRequests] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calendar state
  const today = startOfDay(new Date());
  const [viewMonth, setViewMonth] = useState(today);

  const nights =
    startDate && endDate ? differenceInCalendarDays(endDate, startDate) : 0;
  const subtotal = pricePerNight * nights;
  const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE * 100) / 100;
  const total = Math.round((subtotal + serviceFee) * 100) / 100;

  const handleDayClick = useCallback(
    (date: Date) => {
      if (isUnavailable(date, unavailableSet) || date < today) return;

      if (!startDate || (startDate && endDate)) {
        // Start a new selection
        setStartDate(date);
        setEndDate(null);
        return;
      }

      // We have a start, picking end
      if (date <= startDate) {
        setStartDate(date);
        setEndDate(null);
        return;
      }

      // Check if any unavailable date in range
      const days = eachDayOfInterval({ start: startDate, end: date });
      const hasUnavailable = days.some((d) => isUnavailable(d, unavailableSet));
      if (hasUnavailable) {
        setError("La période sélectionnée contient des dates non disponibles.");
        return;
      }

      setError(null);
      setEndDate(date);
    },
    [startDate, endDate, unavailableSet, today]
  );

  const isInRange = useCallback(
    (date: Date): boolean => {
      const end = endDate ?? hoverDate;
      if (!startDate || !end) return false;
      return date > startDate && date < end;
    },
    [startDate, endDate, hoverDate]
  );

  const isSelected = useCallback(
    (date: Date): boolean => {
      if (startDate && toDateKey(date) === toDateKey(startDate)) return true;
      if (endDate && toDateKey(date) === toDateKey(endDate)) return true;
      return false;
    },
    [startDate, endDate]
  );

  async function handleSubmit() {
    if (!startDate || !endDate) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          specialRequests: specialRequests || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Une erreur est survenue.");
        return;
      }

      // Redirect to Stripe Checkout
      window.location.href = data.checkoutUrl;
    } catch {
      setError("Impossible de contacter le serveur. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  // Build calendar days
  const firstDay = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
  const lastDay = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0);
  const startWeekday = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Mon=0
  const calDays: (Date | null)[] = [
    ...Array(startWeekday).fill(null),
    ...Array.from({ length: lastDay.getDate() }, (_, i) => new Date(firstDay.getFullYear(), firstDay.getMonth(), i + 1)),
  ];

  return (
    <div className="space-y-6">
      {/* Calendar */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={() => setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
            className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Mois précédent"
          >
            ←
          </button>
          <span className="font-semibold capitalize text-sm">
            {format(viewMonth, "MMMM yyyy", { locale: fr })}
          </span>
          <button
            type="button"
            onClick={() => setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
            className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Mois suivant"
          >
            →
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 text-center text-xs text-zinc-500 mb-1">
          {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((d) => (
            <div key={d} className="py-1">{d}</div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 text-sm">
          {calDays.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} />;
            const isDisabled = isUnavailable(day, unavailableSet) || day < today;
            const selected = isSelected(day);
            const inRange = isInRange(day);
            return (
              <button
                key={day.toISOString()}
                type="button"
                disabled={isDisabled}
                onClick={() => handleDayClick(day)}
                onMouseEnter={() => setHoverDate(day)}
                onMouseLeave={() => setHoverDate(null)}
                className={cn(
                  "relative h-9 w-full text-center transition-colors",
                  isDisabled && "text-zinc-300 dark:text-zinc-600 cursor-not-allowed line-through",
                  !isDisabled && !selected && !inRange && "hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg cursor-pointer",
                  inRange && "bg-zinc-100 dark:bg-zinc-800",
                  selected && "bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-lg font-semibold",
                )}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selection summary */}
      <div className="flex gap-2 text-sm">
        <div className={cn("flex-1 border rounded-lg p-3", startDate ? "border-zinc-900 dark:border-zinc-100" : "border-zinc-200 dark:border-zinc-700")}>
          <div className="text-xs text-zinc-500 uppercase tracking-wide mb-0.5">Arrivée</div>
          <div className="font-medium">{startDate ? format(startDate, "d MMM yyyy", { locale: fr }) : "—"}</div>
        </div>
        <div className={cn("flex-1 border rounded-lg p-3", endDate ? "border-zinc-900 dark:border-zinc-100" : "border-zinc-200 dark:border-zinc-700")}>
          <div className="text-xs text-zinc-500 uppercase tracking-wide mb-0.5">Départ</div>
          <div className="font-medium">{endDate ? format(endDate, "d MMM yyyy", { locale: fr }) : "—"}</div>
        </div>
      </div>

      {/* Price breakdown */}
      {nights > 0 && (
        <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span>{pricePerNight.toFixed(2)} € × {nights} nuit{nights > 1 ? "s" : ""}</span>
            <span>{subtotal.toFixed(2)} €</span>
          </div>
          <div className="flex justify-between text-zinc-500">
            <span>Frais de service (12 %)</span>
            <span>{serviceFee.toFixed(2)} €</span>
          </div>
          <div className="flex justify-between font-semibold pt-2 border-t border-zinc-200 dark:border-zinc-700">
            <span>Total</span>
            <span>{total.toFixed(2)} €</span>
          </div>
        </div>
      )}

      {/* Special requests */}
      {nights > 0 && (
        <div>
          <label className="block text-sm font-medium mb-1">
            Demandes spéciales <span className="text-zinc-400">(optionnel)</span>
          </label>
          <textarea
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            rows={3}
            placeholder="Informations utiles pour l'hôte…"
            className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm outline-none focus:border-zinc-900 dark:focus:border-zinc-100 transition-colors resize-none"
          />
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <Button
        className="w-full h-11 text-base"
        disabled={!startDate || !endDate || loading}
        onClick={handleSubmit}
      >
        {loading ? "Redirection…" : nights > 0 ? `Réserver pour ${total.toFixed(2)} €` : "Sélectionnez vos dates"}
      </Button>

      <p className="text-xs text-center text-zinc-500">Aucun débit avant confirmation de paiement</p>
    </div>
  );
}
