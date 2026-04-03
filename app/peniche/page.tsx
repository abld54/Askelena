"use client";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { BookingSection } from "@/components/booking-section";

/* --- Amenity icons --- */

const amenityIcons: Record<string, React.ReactNode> = {
  "WiFi haut debit": (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.55a11 11 0 0114 0M1.42 9a16 16 0 0121.16 0M8.53 16.11a6 6 0 016.95 0M12 20h.01" />
    </svg>
  ),
  "Cuisine equipee": (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2M7 2v20M21 15V2v0a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
    </svg>
  ),
  "Terrasse panoramique": (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  ),
  "Chauffage": (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v10M18.4 6.6a9 9 0 11-12.77.04" />
    </svg>
  ),
  "Lave-linge": (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="3" />
      <circle cx="12" cy="13" r="5" />
      <path d="M6 6h.01M9 6h.01" />
    </svg>
  ),
  "Lit king-size": (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 4v16M22 4v16M2 12h20M2 8h20M7 12V8M17 12V8" />
    </svg>
  ),
  "Vue sur la Seine": (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  "Amarrage prive": (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="5" r="3" />
      <path d="M12 8v8M5 21c0-4 3-7 7-7s7 3 7 7" />
    </svg>
  ),
  "Velos": (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="5.5" cy="17.5" r="3.5" />
      <circle cx="18.5" cy="17.5" r="3.5" />
      <path d="M15 6a1 1 0 100-2 1 1 0 000 2zM12 17.5V14l-3-3 4-3 2 3h3" />
    </svg>
  ),
  "Petit-dejeuner": (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 8h1a4 4 0 010 8h-1M3 8h14v9a4 4 0 01-4 4H7a4 4 0 01-4-4V8zM6 2v4M10 2v4M14 2v4" />
    </svg>
  ),
};

const amenities = [
  "WiFi haut debit",
  "Cuisine equipee",
  "Terrasse panoramique",
  "Chauffage",
  "Lave-linge",
  "Lit king-size",
  "Vue sur la Seine",
  "Amarrage prive",
  "Velos",
  "Petit-dejeuner",
];

const galleryItems = [
  { label: "Salon", gradient: "from-[#1B3A6B] to-[#0F2044]" },
  { label: "Chambre principale", gradient: "from-[#0F2044] to-[#1B3A6B]" },
  { label: "Terrasse", gradient: "from-[#1B3A6B] to-[#2a5a3a]" },
  { label: "Cuisine", gradient: "from-[#2a5a3a] to-[#1B3A6B]" },
  { label: "Salle de bain", gradient: "from-[#0F2044] to-[#2a5a3a]" },
  { label: "Vue Seine", gradient: "from-[#1B3A6B] to-[#C9A84C]/30" },
];

export default function PenichePage() {
  return (
    <main className="flex-1">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F2044] via-[#1B3A6B] to-[#0F2044]" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-[#C9A84C]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 -left-32 w-80 h-80 bg-[#C9A84C]/5 rounded-full blur-3xl" />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <span className="inline-block text-[#C9A84C]/70 text-sm tracking-[0.3em] uppercase mb-6">
            Neuilly-sur-Seine — Seine
          </span>
          <h1
            className="text-5xl sm:text-7xl md:text-8xl font-semibold text-white mb-6 tracking-tight"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            La Peniche
          </h1>
          <p className="text-white/50 text-base sm:text-lg max-w-xl mx-auto mb-12 leading-relaxed">
            Votre escapade flottante d&apos;exception sur la Seine
          </p>
          <a
            href="#booking"
            className="inline-block bg-[#C9A84C] hover:bg-[#E5C158] text-[#0F2044] font-semibold px-10 py-4 rounded-xl text-lg transition-all duration-300 shadow-lg shadow-[#C9A84C]/20 hover:shadow-xl hover:shadow-[#C9A84C]/30"
          >
            Reserver cette peniche
          </a>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30">
          <span className="text-xs tracking-widest uppercase">Decouvrir</span>
          <svg className="w-5 h-5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* Quick stats */}
      <section className="bg-white py-8 border-b border-[#0F2044]/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            {[
              { value: "6", label: "Voyageurs" },
              { value: "3", label: "Chambres" },
              { value: "25m\u00B2", label: "Terrasse" },
              { value: "Seine", label: "Vue" },
            ].map((stat, i) => (
              <div key={stat.label} className="flex items-center gap-8">
                <div className="text-center">
                  <div
                    className="text-2xl md:text-3xl font-semibold text-[#0F2044]"
                    style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                  >
                    {stat.value}
                  </div>
                  <div className="text-[#0F2044]/50 text-xs font-medium uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
                {i < 3 && (
                  <div className="hidden md:block w-px h-10 bg-[#0F2044]/10" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="bg-white py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              className="text-3xl md:text-5xl font-semibold text-[#0F2044] mb-4"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              Decouvrez nos espaces
            </h2>
            <p className="text-[#0F2044]/50 text-lg max-w-2xl mx-auto">
              Chaque recoin a ete pense pour votre confort et votre emerveillement.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {galleryItems.map((item, i) => (
              <div
                key={item.label}
                className={`relative overflow-hidden rounded-2xl ${
                  i === 0 ? "col-span-2 aspect-[2/1]" : "aspect-[4/3]"
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient}`} />
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjwvc3ZnPg==')] opacity-50" />
                <div className="absolute inset-0 flex items-end p-4 md:p-6">
                  <div className="bg-white/10 backdrop-blur-md rounded-xl px-4 py-2 border border-white/10">
                    <span className="text-white text-sm font-medium">{item.label}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="bg-[#FAF8F4] py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <h2
                className="text-3xl md:text-5xl font-semibold text-[#0F2044] mb-8 leading-tight"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
              >
                Une experience unique sur la Seine
              </h2>
              <div className="text-[#0F2044]/60 text-base leading-relaxed space-y-4">
                <p>
                  Amarree sur les berges paisibles de Neuilly-sur-Seine, La Peniche est un lieu
                  d&apos;exception entierement renove avec des materiaux nobles. Trois chambres
                  elegantes, une cuisine ouverte avec ilot central, et une terrasse de 25m&sup2;
                  offrant une vue imprenable sur la Seine.
                </p>
                <p>
                  A quelques minutes de La Defense et des Champs-Elysees, profitez du calme
                  absolu de la vie sur l&apos;eau tout en restant au coeur de l&apos;agglomeration
                  parisienne. Le matin, prenez votre cafe en regardant les bateaux glisser.
                  Le soir, dinez sous les etoiles au fil de l&apos;eau.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "6", label: "Voyageurs" },
                { value: "3", label: "Chambres" },
                { value: "25m\u00B2", label: "Terrasse" },
                { value: "Seine", label: "Vue" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white rounded-2xl p-6 md:p-8 text-center shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  <div
                    className="text-3xl md:text-4xl font-semibold text-[#0F2044] mb-2"
                    style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                  >
                    {stat.value}
                  </div>
                  <div className="text-[#0F2044]/50 text-sm font-medium uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Amenities */}
      <section className="bg-[#0F2044] py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              className="text-3xl md:text-5xl font-semibold text-white mb-4"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              Ce qui vous attend
            </h2>
            <p className="text-white/40 text-lg max-w-2xl mx-auto">
              Tout a ete prevu pour que votre sejour soit inoubliable.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 md:gap-8">
            {amenities.map((amenity) => (
              <div key={amenity} className="flex flex-col items-center gap-3 group">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#C9A84C] group-hover:bg-[#C9A84C]/10 group-hover:border-[#C9A84C]/30 transition-all duration-300">
                  {amenityIcons[amenity] || (
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-white/60 text-xs text-center font-medium leading-tight">
                  {amenity}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking */}
      <BookingSection listingSlug="listing-peniche-001" />

      {/* Location */}
      <section className="bg-[#FAF8F4] py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              className="text-3xl md:text-5xl font-semibold text-[#0F2044] mb-4"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              Comment nous trouver
            </h2>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3
                    className="text-xl font-semibold text-[#0F2044] mb-4"
                    style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                  >
                    Adresse
                  </h3>
                  <p className="text-[#0F2044]/60 text-sm leading-relaxed mb-6">
                    Berges de la Seine<br />
                    Neuilly-sur-Seine, Hauts-de-Seine
                  </p>
                  <h3
                    className="text-xl font-semibold text-[#0F2044] mb-4"
                    style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                  >
                    Acces
                  </h3>
                  <ul className="text-[#0F2044]/60 text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-[#C9A84C] mt-0.5">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      Metro Pont de Neuilly (ligne 1)
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#C9A84C] mt-0.5">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      La Defense a 5 min
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#C9A84C] mt-0.5">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      Champs-Elysees a 10 min
                    </li>
                  </ul>
                </div>
                <div className="flex items-center justify-center">
                  <div className="w-full aspect-square rounded-2xl bg-gradient-to-br from-[#1B3A6B] to-[#0F2044] flex items-center justify-center">
                    <div className="text-center">
                      <svg className="w-12 h-12 text-[#C9A84C]/60 mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                      <span className="text-white/40 text-sm">Neuilly-sur-Seine</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#0F2044] py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2
            className="text-3xl md:text-4xl font-semibold text-white mb-6"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Reservez La Peniche
          </h2>
          <p className="text-white/50 text-lg mb-8 max-w-xl mx-auto">
            Vivez une experience unique sur la Seine, au coeur de Neuilly-sur-Seine.
          </p>
          <a
            href="#booking"
            className="inline-block bg-[#C9A84C] hover:bg-[#E5C158] text-[#0F2044] font-semibold px-10 py-4 rounded-xl text-lg transition-all duration-300 shadow-lg shadow-[#C9A84C]/20 hover:shadow-xl hover:shadow-[#C9A84C]/30"
          >
            Reserver cette peniche
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}
