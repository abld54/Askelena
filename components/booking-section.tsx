"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  format,
  addMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isBefore,
  isSameDay,
  isAfter,
  addDays,
  startOfDay,
  differenceInCalendarDays,
} from "date-fns";
import { fr } from "date-fns/locale";

type PricingMode = "nuit" | "semaine" | "mois";

const DEFAULT_PRICE_PER_NIGHT = 280;
const DEFAULT_CAPACITY = 6;
const SERVICE_FEE_RATE = 0.10;

const PRICING: Record<PricingMode, { nights: number; pricePerNight: number; label: string; desc: string }> = {
  nuit: { nights: 1, pricePerNight: 280, label: "Nuit", desc: "A partir de 1 nuit" },
  semaine: { nights: 7, pricePerNight: 240, label: "Semaine", desc: "7 nuits \u2014 economisez 280\u20AC" },
  mois: { nights: 30, pricePerNight: 187, label: "Mois", desc: "30 nuits \u2014 economisez 2 800\u20AC" },
};

function CalendarMonth({
  month,
  unavailable,
  external,
  startDate,
  endDate,
  onSelectDate,
  today,
}: {
  month: Date;
  unavailable: Set<string>;
  external: Set<string>;
  startDate: Date | null;
  endDate: Date | null;
  onSelectDate: (d: Date) => void;
  today: Date;
}) {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDow = getDay(monthStart);
  // Monday-based: 0=Mon, 6=Sun
  const offset = startDow === 0 ? 6 : startDow - 1;

  const dayNames = ["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"];

  return (
    <div>
      <h4
        className="text-center text-[#0F2044] font-semibold text-lg mb-4 capitalize"
        style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
      >
        {format(month, "MMMM yyyy", { locale: fr })}
      </h4>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((d) => (
          <div key={d} className="text-center text-xs text-[#0F2044]/50 font-medium py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: offset }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const isPast = isBefore(day, today);
          const isUnavailable = unavailable.has(dateStr);
          const isExternal = external.has(dateStr);
          const disabled = isPast || isUnavailable;

          const isStart = startDate && isSameDay(day, startDate);
          const isEnd = endDate && isSameDay(day, endDate);
          const isInRange =
            startDate &&
            endDate &&
            isAfter(day, startDate) &&
            isBefore(day, endDate);

          let className =
            "relative h-10 w-full flex items-center justify-center text-sm rounded-lg transition-all duration-200 ";

          if (disabled && isExternal && !isPast) {
            className += "bg-red-50 text-red-400 cursor-not-allowed line-through font-medium";
          } else if (disabled) {
            className += "text-[#0F2044]/20 cursor-not-allowed line-through";
          } else if (isStart || isEnd) {
            className +=
              "bg-[#C9A84C] text-[#0F2044] font-semibold cursor-pointer shadow-md";
          } else if (isInRange) {
            className +=
              "bg-[#C9A84C]/15 text-[#0F2044] cursor-pointer";
          } else {
            className +=
              "text-[#0F2044] hover:bg-[#C9A84C]/10 cursor-pointer";
          }

          return (
            <button
              key={dateStr}
              type="button"
              disabled={disabled}
              onClick={() => !disabled && onSelectDate(day)}
              className={className}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function BookingSection({ listingSlug }: { listingSlug?: string } = {}) {
  const [mode, setMode] = useState<PricingMode>("nuit");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [guests, setGuests] = useState(2);
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(null);

  // Guest info state
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [guestInfoPreFilled, setGuestInfoPreFilled] = useState(false);

  // Client-side fetched data
  const [listingId, setListingId] = useState<string>("");
  const [pricePerNight, setPricePerNight] = useState(DEFAULT_PRICE_PER_NIGHT);
  const [capacity, setCapacity] = useState(DEFAULT_CAPACITY);
  const [unavailableDates, setUnavailableDates] = useState<string[]>([]);
  const [externalDates, setExternalDates] = useState<string[]>([]);

  // Load guest info from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("askelena_guest");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name) setGuestName(parsed.name);
        if (parsed.email) setGuestEmail(parsed.email);
        if (parsed.phone) setGuestPhone(parsed.phone);
        if (parsed.name || parsed.email || parsed.phone) {
          setGuestInfoPreFilled(true);
        }
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  const today = useMemo(() => startOfDay(new Date()), []);
  const nextMonth = addMonths(currentMonth, 1);

  // Fetch listing info on mount
  useEffect(() => {
    const qs = listingSlug ? `?listing=${listingSlug}` : "";
    fetch(`/api/listing${qs}`)
      .then((r) => r.json())
      .then((data: { id?: string; pricePerNight?: number; capacity?: number }) => {
        if (data.id) setListingId(data.id);
        if (data.pricePerNight) setPricePerNight(data.pricePerNight);
        if (data.capacity) setCapacity(data.capacity);
      })
      .catch(() => {
        // keep defaults
      });
  }, [listingSlug]);

  // Fetch unavailable dates on mount
  useEffect(() => {
    const qs = listingSlug ? `?listing=${listingSlug}` : "";
    fetch(`/api/availability${qs}`)
      .then((r) => r.json())
      .then((data: string[] | { unavailable?: string[]; external?: string[] }) => {
        if (Array.isArray(data)) {
          // Legacy format (flat array)
          setUnavailableDates(data);
        } else {
          // New format with external dates
          setUnavailableDates(data.unavailable || []);
          setExternalDates(data.external || []);
        }
      })
      .catch(() => {
        // keep empty
      });
  }, [listingSlug]);

  const unavailableSet = useMemo(
    () => new Set(unavailableDates),
    [unavailableDates]
  );

  const externalSet = useMemo(
    () => new Set(externalDates),
    [externalDates]
  );

  const handleSelectDate = useCallback(
    (day: Date) => {
      if (!startDate || (startDate && endDate)) {
        // Start fresh selection
        setStartDate(day);
        if (mode === "semaine") {
          setEndDate(addDays(day, 7));
        } else if (mode === "mois") {
          setEndDate(addDays(day, 30));
        } else {
          setEndDate(null);
        }
      } else {
        // We have a start, set end
        if (isBefore(day, startDate)) {
          setStartDate(day);
          if (mode === "semaine") {
            setEndDate(addDays(day, 7));
          } else if (mode === "mois") {
            setEndDate(addDays(day, 30));
          } else {
            setEndDate(startDate);
          }
        } else {
          setEndDate(day);
        }
      }
      setError(null);
      setConfirmationMessage(null);
    },
    [startDate, endDate, mode]
  );

  // When mode changes, auto-adjust end date
  useEffect(() => {
    if (startDate) {
      if (mode === "semaine") {
        setEndDate(addDays(startDate, 7));
      } else if (mode === "mois") {
        setEndDate(addDays(startDate, 30));
      }
    }
  }, [mode, startDate]);

  const nights = startDate && endDate ? differenceInCalendarDays(endDate, startDate) : 0;

  const pricing = useMemo(() => {
    if (nights <= 0) return null;
    let effectiveRate = pricePerNight;
    if (mode === "semaine" && nights >= 7) {
      effectiveRate = 240;
    } else if (mode === "mois" && nights >= 30) {
      effectiveRate = 187;
    }
    const subtotal = effectiveRate * nights;
    const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE * 100) / 100;
    const total = Math.round((subtotal + serviceFee) * 100) / 100;
    return { effectiveRate, subtotal, serviceFee, total };
  }, [nights, mode, pricePerNight]);

  const handleSubmit = async () => {
    if (!startDate || !endDate || nights < 1) {
      setError("Veuillez selectionner des dates.");
      return;
    }
    if (!guestName.trim() || !guestEmail.trim() || !guestPhone.trim()) {
      setError("Veuillez remplir tous les champs obligatoires (nom, email, telephone).");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(guestEmail.trim())) {
      setError("Veuillez entrer une adresse email valide.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    setConfirmationMessage(null);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: listingId || "default",
          startDate: format(startDate, "yyyy-MM-dd"),
          endDate: format(endDate, "yyyy-MM-dd"),
          guests,
          guestName: guestName.trim(),
          guestEmail: guestEmail.trim(),
          guestPhone: guestPhone.trim(),
          specialRequests: specialRequests.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Une erreur est survenue.");
        return;
      }

      if (data.success) {
        setConfirmationMessage(
          data.message || "Demande de reservation recue. Nous vous contacterons sous 24h."
        );
        // Save guest info to localStorage
        try {
          localStorage.setItem("askelena_guest", JSON.stringify({
            name: guestName.trim(),
            email: guestEmail.trim(),
            phone: guestPhone.trim(),
          }));
        } catch {
          // ignore storage errors
        }
        // Reset selection
        setStartDate(null);
        setEndDate(null);
      } else if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch {
      setError("Erreur de connexion. Veuillez reessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const pricingModes: PricingMode[] = ["nuit", "semaine", "mois"];

  return (
    <section id="booking" className="bg-[#FAF8F4] py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2
            className="text-3xl md:text-5xl font-semibold text-[#0F2044] mb-4"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Reservez votre sejour
          </h2>
          <p className="text-[#0F2044]/60 text-lg max-w-2xl mx-auto">
            Choisissez vos dates et profitez de tarifs avantageux pour les sejours prolonges.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 max-w-3xl mx-auto">
          {pricingModes.map((m) => {
            const p = PRICING[m];
            const isActive = mode === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`relative rounded-2xl p-6 text-left transition-all duration-300 border-2 ${
                  isActive
                    ? "border-[#C9A84C] bg-white shadow-lg shadow-[#C9A84C]/10"
                    : "border-transparent bg-white/60 hover:bg-white hover:shadow-md"
                }`}
              >
                {m === "semaine" && (
                  <span className="absolute -top-3 right-4 bg-[#C9A84C] text-[#0F2044] text-xs font-semibold px-3 py-1 rounded-full">
                    Populaire
                  </span>
                )}
                <div className="text-[#0F2044]/50 text-sm font-medium mb-2 uppercase tracking-wider">
                  {p.label}
                </div>
                <div
                  className="text-3xl font-semibold text-[#0F2044] mb-1"
                  style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                >
                  {p.pricePerNight}&euro;
                  <span className="text-base font-normal text-[#0F2044]/50"> / nuit</span>
                </div>
                <div className="text-sm text-[#0F2044]/50">{p.desc}</div>
              </button>
            );
          })}
        </div>

        {/* Calendar + Booking form */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 max-w-6xl mx-auto">
          {/* Calendar -- 3 cols */}
          <div className="lg:col-span-3 bg-white rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <button
                type="button"
                onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
                className="p-2 rounded-lg hover:bg-[#0F2044]/5 text-[#0F2044]/60 hover:text-[#0F2044] transition-colors"
                disabled={isBefore(addMonths(currentMonth, -1), startOfMonth(today))}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M12 15L7 10L12 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <div className="text-[#0F2044] font-medium text-sm">
                Selectionnez vos dates
              </div>
              <button
                type="button"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-2 rounded-lg hover:bg-[#0F2044]/5 text-[#0F2044]/60 hover:text-[#0F2044] transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M8 5L13 10L8 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <CalendarMonth
                month={currentMonth}
                unavailable={unavailableSet}
                external={externalSet}
                startDate={startDate}
                endDate={endDate}
                onSelectDate={handleSelectDate}
                today={today}
              />
              <CalendarMonth
                month={nextMonth}
                unavailable={unavailableSet}
                external={externalSet}
                startDate={startDate}
                endDate={endDate}
                onSelectDate={handleSelectDate}
                today={today}
              />
            </div>

            {/* Calendar legend */}
            {externalDates.length > 0 && (
              <div className="mt-6 pt-4 border-t border-[#0F2044]/10 flex flex-wrap items-center gap-5 text-xs text-[#0F2044]/50">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 rounded bg-red-50 border border-red-200" />
                  <span>Reserve ailleurs</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 rounded bg-[#0F2044]/5 border border-[#0F2044]/10" />
                  <span>Indisponible</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 rounded bg-[#C9A84C]" />
                  <span>Selection</span>
                </div>
              </div>
            )}

            {startDate && (
              <div className="mt-6 pt-6 border-t border-[#0F2044]/10 flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-[#0F2044]/50">Arrivee:</span>
                  <span className="font-medium text-[#0F2044] capitalize">
                    {format(startDate, "d MMMM yyyy", { locale: fr })}
                  </span>
                </div>
                {endDate && (
                  <div className="flex items-center gap-2">
                    <span className="text-[#0F2044]/50">Depart:</span>
                    <span className="font-medium text-[#0F2044] capitalize">
                      {format(endDate, "d MMMM yyyy", { locale: fr })}
                    </span>
                  </div>
                )}
                {nights > 0 && (
                  <div className="text-[#C9A84C] font-medium">
                    {nights} nuit{nights > 1 ? "s" : ""}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Booking summary -- 2 cols */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm sticky top-28">
              <h3
                className="text-xl font-semibold text-[#0F2044] mb-6"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
              >
                Votre reservation
              </h3>

              {/* Guest count */}
              <div className="mb-6">
                <label className="block text-sm text-[#0F2044]/60 mb-2">
                  Nombre de voyageurs
                </label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setGuests(Math.max(1, guests - 1))}
                    className="w-10 h-10 rounded-full border border-[#0F2044]/20 flex items-center justify-center text-[#0F2044] hover:border-[#C9A84C] transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                  <span className="text-lg font-medium text-[#0F2044] min-w-[3ch] text-center">
                    {guests}
                  </span>
                  <button
                    type="button"
                    onClick={() => setGuests(Math.min(capacity, guests + 1))}
                    className="w-10 h-10 rounded-full border border-[#0F2044]/20 flex items-center justify-center text-[#0F2044] hover:border-[#C9A84C] transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                  <span className="text-sm text-[#0F2044]/40">
                    max {capacity}
                  </span>
                </div>
              </div>

              {/* Price breakdown */}
              {pricing && nights > 0 ? (
                <div className="space-y-3 mb-8">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#0F2044]/60">
                      {pricing.effectiveRate}&euro; x {nights} nuit{nights > 1 ? "s" : ""}
                    </span>
                    <span className="text-[#0F2044]">{pricing.subtotal.toLocaleString("fr-FR")}&euro;</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#0F2044]/60">Frais de service (10%)</span>
                    <span className="text-[#0F2044]">{pricing.serviceFee.toLocaleString("fr-FR")}&euro;</span>
                  </div>
                  <div className="border-t border-[#0F2044]/10 pt-3 flex justify-between">
                    <span className="font-semibold text-[#0F2044]">Total</span>
                    <span
                      className="text-xl font-semibold text-[#0F2044]"
                      style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                    >
                      {pricing.total.toLocaleString("fr-FR")}&euro;
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 mb-8 text-[#0F2044]/40 text-sm">
                  Selectionnez vos dates pour voir le tarif
                </div>
              )}

              {/* Guest info form */}
              <div className="mb-6">
                <h4
                  className="text-sm font-semibold text-[#0F2044] mb-4 uppercase tracking-wider"
                >
                  Vos coordonnees
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-[#0F2044]/60 mb-1">
                      Nom complet <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Jean Dupont"
                      className="w-full px-4 py-2.5 border border-[#0F2044]/10 rounded-xl text-[#0F2044] text-sm placeholder:text-[#0F2044]/30 focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/30 focus:outline-none transition-colors bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#0F2044]/60 mb-1">
                      Email <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="jean@exemple.fr"
                      className="w-full px-4 py-2.5 border border-[#0F2044]/10 rounded-xl text-[#0F2044] text-sm placeholder:text-[#0F2044]/30 focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/30 focus:outline-none transition-colors bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#0F2044]/60 mb-1">
                      Telephone <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      placeholder="+33 6 12 34 56 78"
                      className="w-full px-4 py-2.5 border border-[#0F2044]/10 rounded-xl text-[#0F2044] text-sm placeholder:text-[#0F2044]/30 focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/30 focus:outline-none transition-colors bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#0F2044]/60 mb-1">
                      Demandes speciales
                    </label>
                    <textarea
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      placeholder="Arrivee tardive, lit bebe, etc."
                      rows={2}
                      className="w-full px-4 py-2.5 border border-[#0F2044]/10 rounded-xl text-[#0F2044] text-sm placeholder:text-[#0F2044]/30 focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/30 focus:outline-none transition-colors bg-white resize-none"
                    />
                  </div>
                </div>
                {guestInfoPreFilled && (
                  <p className="mt-2 text-xs text-[#C9A84C] flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Vos informations sont sauvegardees pour vos prochaines visites
                  </p>
                )}
              </div>

              {/* Confirmation message */}
              {confirmationMessage && (
                <div className="mb-4 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <p>{confirmationMessage}</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm">
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={!startDate || !endDate || nights < 1 || isSubmitting || !guestName.trim() || !guestEmail.trim() || !guestPhone.trim()}
                className="w-full bg-[#C9A84C] hover:bg-[#E5C158] disabled:opacity-50 disabled:cursor-not-allowed text-[#0F2044] font-semibold py-4 rounded-xl text-lg transition-all duration-300 shadow-lg shadow-[#C9A84C]/20 hover:shadow-xl hover:shadow-[#C9A84C]/30"
              >
                {isSubmitting ? "Reservation en cours..." : "Reserver"}
              </button>

              <p className="text-center text-xs text-[#0F2044]/40 mt-4">
                Vous recevrez une confirmation par email sous 24h.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
