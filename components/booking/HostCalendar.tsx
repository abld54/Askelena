"use client";

import { useState, useCallback } from "react";
import { format, startOfDay, eachDayOfInterval } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type Booking = {
  id: string;
  startDate: string;
  endDate: string;
  nights: number;
  totalPrice: number;
  status: string;
  guestName: string;
  guest: { name: string | null; email: string };
};

type BlockedDate = {
  id: string;
  date: string;
};

type Props = {
  listingId: string;
  listingTitle: string;
  initialBlockedDates: BlockedDate[];
  initialBookings: Booking[];
};

function toKey(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

export function HostCalendar({
  listingId,
  listingTitle,
  initialBlockedDates,
  initialBookings,
}: Props) {
  const today = startOfDay(new Date());
  const [viewMonth, setViewMonth] = useState(today);
  const [blockedDates, setBlockedDates] = useState<Set<string>>(
    new Set(initialBlockedDates.map((d) => d.date.split("T")[0]))
  );
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Build a set of booked date keys
  const bookedMap = new Map<string, Booking>();
  for (const booking of initialBookings) {
    if (!["pending", "confirmed"].includes(booking.status)) continue;
    const days = eachDayOfInterval({
      start: startOfDay(new Date(booking.startDate)),
      end: startOfDay(new Date(booking.endDate)),
    });
    for (const d of days) {
      bookedMap.set(toKey(d), booking);
    }
  }

  function toggleDate(date: Date) {
    const key = toKey(date);
    if (bookedMap.has(key)) return; // can't toggle booked days
    setSelectedDates((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  async function applyAction(action: "block" | "unblock") {
    if (selectedDates.size === 0) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/host/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          dates: Array.from(selectedDates),
          action,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        setMessage(`Erreur : ${d.error}`);
        return;
      }
      setBlockedDates((prev) => {
        const next = new Set(prev);
        for (const d of selectedDates) {
          if (action === "block") next.add(d);
          else next.delete(d);
        }
        return next;
      });
      setSelectedDates(new Set());
      setMessage(
        action === "block"
          ? `${selectedDates.size} date(s) bloquée(s).`
          : `${selectedDates.size} date(s) débloquée(s).`
      );
    } finally {
      setSaving(false);
    }
  }

  // Build calendar
  const firstDay = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
  const lastDay = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0);
  const startWeekday = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  const calDays: (Date | null)[] = [
    ...Array(startWeekday).fill(null),
    ...Array.from({ length: lastDay.getDate() }, (_, i) =>
      new Date(firstDay.getFullYear(), firstDay.getMonth(), i + 1)
    ),
  ];

  const selectedBlockable = Array.from(selectedDates).filter((d) => !blockedDates.has(d));
  const selectedUnblockable = Array.from(selectedDates).filter((d) => blockedDates.has(d));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-semibold text-lg">{listingTitle}</h2>
        <p className="text-sm text-zinc-500">Calendrier de disponibilité</p>
      </div>

      {/* Calendar */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            ←
          </button>
          <span className="font-semibold capitalize">
            {format(viewMonth, "MMMM yyyy", { locale: fr })}
          </span>
          <button
            type="button"
            onClick={() => setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            →
          </button>
        </div>

        <div className="grid grid-cols-7 text-center text-xs text-zinc-500 mb-1">
          {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((d) => (
            <div key={d} className="py-1">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 text-sm gap-y-0.5">
          {calDays.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} />;
            const key = toKey(day);
            const isPast = day < today;
            const isBooked = bookedMap.has(key);
            const isBlocked = blockedDates.has(key);
            const isSelected = selectedDates.has(key);

            return (
              <button
                key={key}
                type="button"
                disabled={isPast || isBooked}
                onClick={() => toggleDate(day)}
                title={
                  isBooked
                    ? `Réservé — ${bookedMap.get(key)?.guest.name ?? "invité"}`
                    : isBlocked
                    ? "Bloqué (cliquez pour sélectionner)"
                    : undefined
                }
                className={cn(
                  "h-9 w-full rounded-lg text-center transition-colors text-xs",
                  isPast && "text-zinc-300 dark:text-zinc-700 cursor-default",
                  isBooked && !isPast && "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 cursor-default rounded-none",
                  isBlocked && !isBooked && !isPast && "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300",
                  isSelected && !isBooked && "ring-2 ring-zinc-900 dark:ring-zinc-100",
                  !isPast && !isBooked && "cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800",
                )}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-zinc-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-blue-200 dark:bg-blue-900/50" />
          Réservé
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-zinc-200 dark:bg-zinc-700" />
          Bloqué
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded border-2 border-zinc-900 dark:border-zinc-100" />
          Sélectionné
        </div>
      </div>

      {/* Actions */}
      {selectedDates.size > 0 && (
        <div className="flex gap-2">
          {selectedBlockable.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              disabled={saving}
              onClick={() => applyAction("block")}
            >
              Bloquer ({selectedBlockable.length})
            </Button>
          )}
          {selectedUnblockable.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              disabled={saving}
              onClick={() => applyAction("unblock")}
            >
              Débloquer ({selectedUnblockable.length})
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSelectedDates(new Set())}
          >
            Désélectionner
          </Button>
        </div>
      )}

      {message && (
        <p className="text-sm text-green-700 dark:text-green-400">{message}</p>
      )}

      {/* Upcoming bookings */}
      <div>
        <h3 className="font-semibold mb-3">Réservations à venir</h3>
        {initialBookings.length === 0 ? (
          <p className="text-sm text-zinc-400">Aucune réservation à venir.</p>
        ) : (
          <ul className="space-y-3">
            {initialBookings.map((booking) => (
              <li key={booking.id}>
                <Link
                  href={`/bookings/${booking.id}`}
                  className="flex items-center justify-between bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 px-4 py-3 hover:border-zinc-400 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {booking.guest.name ?? booking.guest.email}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {format(new Date(booking.startDate), "d MMM", { locale: fr })} –{" "}
                      {format(new Date(booking.endDate), "d MMM yyyy", { locale: fr })}
                      {" · "}{booking.nights} nuit{booking.nights > 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="text-sm font-semibold">{booking.totalPrice.toFixed(2)} €</div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
