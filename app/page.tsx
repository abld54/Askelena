"use client";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useState, useEffect } from "react";
import Link from "next/link";

/* --- Star rating component --- */

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i < rating ? "text-[#C9A84C]" : "text-[#0F2044]/15"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

/* --- Sample reviews --- */

const sampleReviews = [
  {
    id: "1",
    rating: 5,
    comment: "Un sejour absolument magique ! La peniche est magnifiquement amenagee, le calme du canal au petit matin est incomparable. Nous reviendrons sans hesiter.",
    authorName: "Marie L.",
    date: "fevrier 2026",
  },
  {
    id: "2",
    rating: 5,
    comment: "L'experience Askelena depasse toutes les attentes. La terrasse avec vue sur le canal est un pur bonheur. Le petit-dejeuner inclus est un vrai plus.",
    authorName: "Thomas D.",
    date: "janvier 2026",
  },
  {
    id: "3",
    rating: 4,
    comment: "Cadre exceptionnel et hotes tres attentionnes. La cuisine equipee nous a permis de preparer de bons repas. Seul bemol : le bruit des ecluses le matin.",
    authorName: "Sophie M.",
    date: "decembre 2025",
  },
];

type Review = {
  id: string;
  rating: number;
  comment: string;
  authorName: string;
  date: string;
};

function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>(sampleReviews);

  useEffect(() => {
    fetch("/api/reviews")
      .then((r) => r.json())
      .then((data: Array<{ id: string; rating: number; comment: string; authorName: string; createdAt?: string }>) => {
        if (Array.isArray(data) && data.length > 0) {
          setReviews(
            data.map((r) => ({
              id: r.id,
              rating: r.rating,
              comment: r.comment,
              authorName: r.authorName || "Voyageur",
              date: r.createdAt
                ? new Date(r.createdAt).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
                : "",
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section id="reviews" className="bg-white py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2
            className="text-3xl md:text-5xl font-semibold text-[#0F2044] mb-4"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Ce que disent nos voyageurs
          </h2>
          <p className="text-[#0F2044]/50 text-lg max-w-2xl mx-auto">
            Des moments inoubliables partages par ceux qui ont vecu l&apos;experience Askelena.
          </p>
        </div>

        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-[#FAF8F4] rounded-2xl p-6 md:p-8 hover:shadow-md transition-shadow duration-300"
              >
                <Stars rating={review.rating} />
                <p className="text-[#0F2044]/70 text-sm leading-relaxed mt-4 mb-6">
                  &ldquo;{review.comment}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0F2044]/10 flex items-center justify-center text-[#0F2044] font-medium text-sm">
                    {review.authorName?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div>
                    <div className="text-[#0F2044] text-sm font-medium">
                      {review.authorName ?? "Voyageur"}
                    </div>
                    {review.date && (
                      <div className="text-[#0F2044]/40 text-xs capitalize">
                        {review.date}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-[#0F2044]/40 text-lg mb-2">
              Les premiers avis arrivent bientot
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

/* --- Properties --- */

const properties = [
  {
    name: "La Peniche",
    location: "Neuilly-sur-Seine",
    description: "Votre escapade flottante d\u2019exception sur la Seine",
    guests: 6,
    bedrooms: 3,
    rating: "4.9",
    reviewCount: "32",
    hosting: "12 mois de partage sur Airbnb, Booking et autres plateformes",
    href: "/peniche",
    image: "/peniche-sunset.jpg",
    gradient: "from-[#1B3A6B] via-[#0F2044] to-[#1B3A6B]",
  },
  {
    name: "L\u2019Appartement",
    location: "Courbevoie",
    description: "\u00C9l\u00E9gance parisienne aux portes de La D\u00E9fense",
    guests: 4,
    bedrooms: 2,
    rating: "4.8",
    reviewCount: "21",
    hosting: "12 mois de partage sur Airbnb, Booking et autres plateformes",
    href: "/appartement",
    gradient: "from-[#0F2044] via-[#1B3A6B] to-[#0F2044]",
  },
];

/* --- Services --- */

const services = [
  {
    name: "Champagne & fleurs",
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 2v4M16 2v4M12 11v2M12 17v.01M9.5 2h5l1 4c.3 1.2-.2 2.4-1.2 3.1L12 11l-2.3-1.9C8.7 8.4 8.2 7.2 8.5 6l1-4z" />
        <path d="M12 13a4 4 0 100 8 4 4 0 000-8z" />
      </svg>
    ),
  },
  {
    name: "Chef prive",
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 13.87A4 4 0 014 10V6a4 4 0 018 0v4a4 4 0 01-2 3.87M14 6a4 4 0 014 4v0a4 4 0 01-2 3.87" />
        <path d="M6 17l6 4 6-4M12 21V13" />
      </svg>
    ),
  },
  {
    name: "Transfert aeroport",
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12l5-3v2h8V9l5 3-5 3v-2H7v2z" />
        <path d="M22 2L2 22" />
      </svg>
    ),
  },
  {
    name: "Velos & mobilite",
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="5.5" cy="17.5" r="3.5" />
        <circle cx="18.5" cy="17.5" r="3.5" />
        <path d="M15 6a1 1 0 100-2 1 1 0 000 2zM12 17.5V14l-3-3 4-3 2 3h3" />
      </svg>
    ),
  },
  {
    name: "Menage premium",
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v6M12 22v-6M4.93 4.93l4.24 4.24M14.83 14.83l4.24 4.24M2 12h6M22 12h-6M4.93 19.07l4.24-4.24M14.83 9.17l4.24-4.24" />
      </svg>
    ),
  },
  {
    name: "Guide local personnalise",
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
];

/* --- Experience pillars --- */

const pillars = [
  {
    title: "Selection rigoureuse",
    description: "Chaque bien est personnellement inspecte et selectionne pour garantir un niveau d\u2019exception.",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    title: "Service conciergerie",
    description: "Champagne, chef prive, transferts aeroport : nous anticipons chacun de vos souhaits.",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 8h1a4 4 0 010 8h-1M3 8h14v9a4 4 0 01-4 4H7a4 4 0 01-4-4V8zM6 2v4M10 2v4M14 2v4" />
      </svg>
    ),
  },
  {
    title: "Sejour sans souci",
    description: "Assistance 7j/7, menage premium et support 24h/24 pour une tranquillite absolue.",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
];

/* --- Trust signals --- */

const trustSignals = [
  {
    text: "Chaque bien est personnellement inspecte",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  {
    text: "Conciergerie 7j/7",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
  },
  {
    text: "Reservation securisee",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" />
      </svg>
    ),
  },
  {
    text: "Paris Ouest & region nicoise",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
];

const ownerBenefits = [
  "Source de revenus additionnels sans engagement rigide.",
  "Mise aux normes et revalorisation du bien avec soutien financier.",
  "Gestion complete: location saisonniere, courte duree et bail mobilite.",
  "Remuneration transparente: pourcentage des revenus locatifs.",
  "Contrats de 1 a 10 ans avec clauses annuelles de sortie claires.",
];

/* --- Page --- */

export default function Home() {
  return (
    <main className="flex-1">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <img
          src="/peniche-sunset.jpg"
          alt="Vue de la péniche au coucher du soleil"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[#0F2044]/68" />
        <div className="absolute top-1/4 -right-32 w-96 h-96 bg-[#C9A84C]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -left-32 w-80 h-80 bg-[#C9A84C]/10 rounded-full blur-3xl" />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1
            className="text-6xl sm:text-8xl md:text-9xl font-semibold text-white mb-6 tracking-tight"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Askelena
          </h1>
          <p
            className="text-xl sm:text-2xl text-white/70 mb-4"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Conciergerie et gestion locative premium
          </p>
          <p className="text-white/45 text-base sm:text-lg max-w-2xl mx-auto mb-12 leading-relaxed">
            Paris Ouest et region nicoise — excellence hoteliere, gestion complete, revenus optimises.
          </p>
          <a
            href="#properties"
            className="inline-block bg-[#C9A84C] hover:bg-[#E5C158] text-[#0F2044] font-semibold px-10 py-4 rounded-xl text-lg transition-all duration-300 shadow-lg shadow-[#C9A84C]/20 hover:shadow-xl hover:shadow-[#C9A84C]/30"
          >
            Decouvrir nos biens
          </a>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30">
          <span className="text-xs tracking-widest uppercase">Decouvrir</span>
          <svg className="w-5 h-5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* Notre mission */}
      <section className="bg-white py-20 md:py-24 border-b border-[#0F2044]/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2
              className="text-3xl md:text-5xl font-semibold text-[#0F2044] mb-4"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              Notre mission
            </h2>
            <p className="text-[#0F2044]/65 text-base md:text-lg leading-relaxed max-w-4xl mx-auto">
              Nous aidons les proprietaires a augmenter les revenus de leur residence principale ou secondaire,
              sans perdre en flexibilite. Askelena associe l'art de vivre a la francaise a l'excellence de service
              inspiree de la culture philippine, avec une approche axee sur la qualite plutot que la quantite.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            {ownerBenefits.map((item) => (
              <div key={item} className="bg-[#FAF8F4] rounded-2xl px-5 py-4 text-[#0F2044]/75 text-sm md:text-base">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Nos biens d'exception */}
      <section id="properties" className="bg-white py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              className="text-3xl md:text-5xl font-semibold text-[#0F2044] mb-4"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              Nos biens d&apos;exception
            </h2>
            <p className="text-[#0F2044]/50 text-lg max-w-2xl mx-auto">
              Deux adresses d&apos;exception soigneusement selectionnees pour vous offrir le meilleur.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {properties.map((property) => (
              <Link
                key={property.name}
                href={property.href}
                className="group relative overflow-hidden rounded-3xl border-2 border-[#C9A84C]/20 hover:border-[#C9A84C]/60 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#C9A84C]/10"
              >
                <div className={`aspect-[4/3] bg-gradient-to-br ${property.gradient} relative`}>
                  {property.image ? (
                    <img
                      src={property.image}
                      alt={property.name}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjwvc3ZnPg==')] opacity-50" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Property info overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[#C9A84C] text-xs font-semibold tracking-widest uppercase">
                        {property.location}
                      </span>
                    </div>
                    <h3
                      className="text-2xl md:text-3xl font-semibold text-white mb-2"
                      style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                    >
                      {property.name}
                    </h3>
                    <p className="text-white/70 text-sm mb-3">{property.description}</p>
                    <div className="flex items-center gap-2 text-white/90 text-xs mb-2">
                      <span>★ {property.rating}</span>
                      <span className="text-white/50">({property.reviewCount} notes)</span>
                    </div>
                    <div className="text-white/60 text-[11px] mb-4">
                      {property.hosting}
                    </div>
                    <div className="flex items-center gap-4 text-white/50 text-xs">
                      <span>{property.guests} voyageurs</span>
                      <span className="w-1 h-1 rounded-full bg-white/30" />
                      <span>{property.bedrooms} chambres</span>
                    </div>
                  </div>
                </div>

                {/* Hover arrow */}
                <div className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 17L17 7M17 7H7M17 7v10" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* L'experience Askelena */}
      <section id="experience" className="bg-[#FAF8F4] py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              className="text-3xl md:text-5xl font-semibold text-[#0F2044] mb-4"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              L&apos;experience Askelena
            </h2>
            <p className="text-[#0F2044]/50 text-lg max-w-2xl mx-auto">
              Un service d&apos;exception pour des sejours inoubliables.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pillars.map((pillar) => (
              <div
                key={pillar.title}
                className="bg-white rounded-3xl p-8 md:p-10 text-center hover:shadow-lg transition-shadow duration-300"
              >
                <div className="w-16 h-16 rounded-2xl bg-[#C9A84C]/10 flex items-center justify-center text-[#C9A84C] mx-auto mb-6">
                  {pillar.icon}
                </div>
                <h3
                  className="text-xl font-semibold text-[#0F2044] mb-3"
                  style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                >
                  {pillar.title}
                </h3>
                <p className="text-[#0F2044]/60 text-sm leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services conciergerie */}
      <section id="services" className="bg-[#0F2044] py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              className="text-3xl md:text-5xl font-semibold text-white mb-4"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              Services conciergerie
            </h2>
            <p className="text-white/40 text-lg max-w-2xl mx-auto">
              Des prestations sur mesure pour sublimer votre sejour.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto">
            {services.map((service) => (
              <div
                key={service.name}
                className="flex flex-col items-center gap-4 group"
              >
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#C9A84C] group-hover:bg-[#C9A84C]/10 group-hover:border-[#C9A84C]/30 transition-all duration-300">
                  {service.icon}
                </div>
                <span className="text-white/60 text-sm text-center font-medium leading-tight">
                  {service.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pourquoi Askelena */}
      <section className="bg-white py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              className="text-3xl md:text-5xl font-semibold text-[#0F2044] mb-4"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              Pourquoi Askelena
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {trustSignals.map((signal) => (
              <div key={signal.text} className="flex flex-col items-center text-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#C9A84C]/10 flex items-center justify-center text-[#C9A84C]">
                  {signal.icon}
                </div>
                <span className="text-[#0F2044]/70 text-sm font-medium leading-snug">
                  {signal.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Espace proprietaires */}
      <section className="bg-[#FAF8F4] py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2
            className="text-3xl md:text-4xl font-semibold text-[#0F2044] mb-5"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Vous avez un bien a louer ?
          </h2>
          <p className="text-[#0F2044]/65 text-base md:text-lg max-w-3xl mx-auto mb-8 leading-relaxed">
            Confiez-nous votre bien et beneficiez d'une gestion premium, d'un plan de valorisation
            et d'un cadre contractuel clair, adapte a votre rythme.
          </p>
          <Link
            href="/louez-nous-vos-biens"
            className="inline-block bg-[#0F2044] hover:bg-[#1B3A6B] text-white font-semibold px-8 py-3.5 rounded-xl transition-colors duration-300"
          >
            Louez-nous vos biens
          </Link>
        </div>
      </section>

      {/* Reviews */}
      <ReviewsSection />

      {/* Footer */}
      <Footer />
    </main>
  );
}
