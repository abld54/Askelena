"use client";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { BookingSection } from "@/components/booking-section";

/* --- Equipements --- */

const amenityGroups = [
  {
    title: "Chambre 1",
    items: [
      "Lit queen size",
      "Chauffage",
      "Cintres",
      "Linge de lit",
      "Espace de rangement pour les vetements",
      "Fer a repasser",
      "Oreillers et couvertures supplementaires",
      "Television",
    ],
  },
  {
    title: "Chambre 2",
    items: ["Canape-lit", "Linge de lit"],
  },
  {
    title: "Salle de bain",
    items: [
      "Chauffage",
      "Eau chaude",
      "Gel douche",
      "Produits de nettoyage",
      "Seche-cheveux",
    ],
  },
  {
    title: "Exterieur",
    items: ["Balcon"],
  },
  {
    title: "Cuisine",
    items: [
      "Cuisine entiere",
      "Bouilloire electrique",
      "Machine a cafe",
      "Cafe",
      "Four",
      "Four a micro-ondes",
      "Grille-pain",
      "Refrigerateur",
      "Plaques de cuisson",
      "Vaisselle et couverts",
      "Verres a vin",
      "Equipements de cuisine de base",
    ],
  },
];

const galleryItems = [
  { label: "Cuisine complete", image: "/appartement-cuisine-1.jpg", gradient: "from-[#0F2044] to-[#1B3A6B]" },
  { label: "Plan de travail", image: "/appartement-cuisine-2.jpg", gradient: "from-[#1B3A6B] to-[#0F2044]" },
  { label: "Espace cuisine", image: "/appartement-cuisine-3.jpg", gradient: "from-[#0F2044] to-[#2a5a3a]" },
  { label: "Cuisine", gradient: "from-[#2a5a3a] to-[#1B3A6B]" },
  { label: "Salle de bain", gradient: "from-[#1B3A6B] to-[#2a5a3a]" },
  { label: "Balcon", gradient: "from-[#0F2044] to-[#C9A84C]/30" },
];

export default function AppartementPage() {
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
            Courbevoie — Hauts-de-Seine
          </span>
          <h1
            className="text-5xl sm:text-7xl md:text-8xl font-semibold text-white mb-6 tracking-tight"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            L&apos;Appartement
          </h1>
          <p className="text-white/50 text-base sm:text-lg max-w-xl mx-auto mb-12 leading-relaxed">
            Elegance parisienne aux portes de La Defense
          </p>
          <a
            href="#booking"
            className="inline-block bg-[#C9A84C] hover:bg-[#E5C158] text-[#0F2044] font-semibold px-10 py-4 rounded-xl text-lg transition-all duration-300 shadow-lg shadow-[#C9A84C]/20 hover:shadow-xl hover:shadow-[#C9A84C]/30"
          >
            Reserver cet appartement
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
              { value: "4", label: "Voyageurs" },
              { value: "2", label: "Chambres" },
              { value: "Balcon", label: "Exterieur" },
              { value: "Ville", label: "Vue" },
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
              Un interieur raffine pense dans les moindres details.
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
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.label}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjwvc3ZnPg==')] opacity-50" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
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
                Elegance contemporaine
              </h2>
              <div className="text-[#0F2044]/60 text-base leading-relaxed space-y-4">
                <p>
                  Ce logement spacieux de 65 m2 offre un sejour calme et confortable avec le luxe d&apos;un jardin.
                  En rez-de-chaussee sureleve dans une impasse, il beneficie d&apos;une entree separee sur la rue.
                  Que vous soyez a Paris pour le plaisir ou le travail, vous etes a 10 minutes de La Defense
                  et 20 minutes du coeur de Paris.
                </p>
                <p>
                  This spacious accommodation of 65 m2 offers a quiet and comfortable stay with the luxury of a garden.
                  On the raised ground floor in a calm cul-de-sac, it benefits from a separate entrance on the street.
                  Whether you are in Paris for pleasure or work, you are in 10 minutes at La Defense and 20 minutes
                  in the heart of Paris.
                </p>
                <p>
                  Le logement comprend une cuisine independante et lumineuse toute equipee donnant sur un jardin ensoleille.
                  Le salon de 30 m2 donne egalement sur le jardin et est equipe d&apos;un canape-lit queen size (2.00 x 1.60 m).
                  La chambre de 15 m2 est equipee d&apos;un lit queen size (2.00 x 1.60 m), avec un petit bureau et une television
                  (200 chaines Orange et acces internet fibre optique). La salle de bain independante est equipee d&apos;une large
                  douche et d&apos;une toilette. L&apos;acces au logement se fait directement depuis la rue, par une porte d&apos;entree situee
                  a gauche de la porte de l&apos;immeuble.
                </p>
                <p>
                  The accommodation includes a fully equipped independent and bright kitchen overlooking a sunny garden.
                  The 30 m2 living room also overlooks the garden and is equipped with a queen-size sofa bed (2.00 x 1.60 m).
                  The 15 m2 bedroom is equipped with a queen-size bed (2.00 x 1.60 m), a small desk and a television
                  (200 Orange channels and fiber optic internet access). The independent bathroom includes a large shower
                  and a toilet. The apartment is accessed directly from the street through an entrance door located to the left
                  of the building entrance.
                </p>
                <p>
                  Les voyageurs peuvent utiliser l&apos;integralite du logement, en veillant a ne plus faire de bruit dans le jardin
                  et l&apos;appartement apres 22h00. Vous pouvez contacter Elena, et si ce numero ne repond pas, contacter Gilles.
                  Elena et Gilles parlent couramment francais et anglais. Le logement est raccorde a la fibre optique avec
                  un Wi-Fi dont le code est donne dans le livret d&apos;accueil.
                </p>
                <p>
                  Guests can use the entire apartment but are required to be quiet after 10:00 pm.
                  You can contact Elena, and if that number doesn&apos;t answer, contact Gilles.
                  Elena and Gilles are fluent in French and English.
                  The apartment is connected to fiber optic internet and the Wi-Fi code is provided in the welcome booklet.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "4", label: "Voyageurs" },
                { value: "2", label: "Chambres" },
                { value: "Balcon", label: "Exterieur" },
                { value: "Ville", label: "Vue" },
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {amenityGroups.map((group) => (
              <div key={group.title} className="bg-white/5 border border-white/10 rounded-2xl p-5 md:p-6">
                <h3
                  className="text-[#C9A84C] text-lg font-semibold mb-4"
                  style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                >
                  {group.title}
                </h3>
                <ul className="space-y-2.5">
                  {group.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-white/70 text-sm">
                      <span className="mt-0.5 text-[#C9A84C]">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking */}
      <BookingSection listingSlug="listing-courbevoie-001" />

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
                    Adresse approximative :<br />
                    17 Impasse Michael Winburn
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
                      Tramway T2 — arret Courbevoie
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#C9A84C] mt-0.5">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      RER A — La Defense a 5 min
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#C9A84C] mt-0.5">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      Paris centre a 15 min en transport
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
                      <span className="text-white/40 text-sm">Courbevoie</span>
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
            Reservez L&apos;Appartement
          </h2>
          <p className="text-white/50 text-lg mb-8 max-w-xl mx-auto">
            Sejournez dans un cadre elegant aux portes de La Defense.
          </p>
          <a
            href="#booking"
            className="inline-block bg-[#C9A84C] hover:bg-[#E5C158] text-[#0F2044] font-semibold px-10 py-4 rounded-xl text-lg transition-all duration-300 shadow-lg shadow-[#C9A84C]/20 hover:shadow-xl hover:shadow-[#C9A84C]/30"
          >
            Reserver cet appartement
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}
