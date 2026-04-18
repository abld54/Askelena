"use client";

import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const points = [
  "Revenus additionnels sans engagement rigide.",
  "Mise aux normes et amelioration du bien avec soutien financier.",
  "Gestion de location saisonniere, courte duree et bail mobilite.",
  "Remuneration basee sur un pourcentage des revenus locatifs.",
  "Contrats de 1 a 10 ans avec clauses annuelles de sortie claires.",
  "Intervention principale: Ouest parisien et region nicoise.",
];

export default function LouezNousVosBiensPage() {
  return (
    <main className="flex-1 bg-[#FAF8F4]">
      <Navbar />

      <section className="relative overflow-hidden bg-[#0F2044] pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(201,168,76,0.18),transparent_45%)]" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <span className="inline-block text-[#C9A84C]/80 text-xs tracking-[0.25em] uppercase mb-5">
            Espace proprietaires
          </span>
          <h1
            className="text-4xl sm:text-6xl md:text-7xl font-semibold text-white mb-6"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Louez-nous vos biens
          </h1>
          <p className="text-white/65 text-base md:text-xl max-w-3xl mx-auto leading-relaxed">
            Nous valorisons votre bien et optimisons vos revenus, avec une gestion haut de gamme
            et un cadre contractuel simple.
          </p>
        </div>
      </section>

      <section className="py-20 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm">
              <h2
                className="text-2xl md:text-4xl font-semibold text-[#0F2044] mb-6"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
              >
                Notre mission
              </h2>
              <div className="space-y-4 text-[#0F2044]/70 leading-relaxed">
                <p>
                  Nous offrons aux proprietaires une source de revenus additionnels en louant
                  leur residence ou un bien qu’ils n’occupent pas toute l’annee.
                </p>
                <p>
                  Askelena associe le mode de vie a la francaise avec l’excellence du service
                  inspiree de la culture philippine, pour une experience 5 etoiles.
                </p>
                <p>
                  Notre approche privilegie la qualite plutot que la quantite, afin d’assurer
                  un service personnalise pour une clientele exigeante.
                </p>
              </div>
            </div>

            <div className="bg-[#0F2044] rounded-3xl p-8 md:p-10 text-white">
              <h3
                className="text-2xl md:text-3xl font-semibold mb-6"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
              >
                Ce que nous prenons en charge
              </h3>
              <ul className="space-y-3">
                {points.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-white/80">
                    <span className="mt-1 text-[#C9A84C]">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 bg-white rounded-3xl p-8 md:p-10 text-center shadow-sm">
            <h3
              className="text-2xl md:text-3xl font-semibold text-[#0F2044] mb-4"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              Parlons de votre bien
            </h3>
            <p className="text-[#0F2044]/65 max-w-2xl mx-auto mb-8">
              Nous etudions votre projet et vous proposons une strategie de location adaptee a vos objectifs.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="mailto:contact@askelena.com?subject=Confier%20mon%20bien%20a%20Askelena"
                className="inline-block bg-[#C9A84C] hover:bg-[#E5C158] text-[#0F2044] font-semibold px-8 py-3 rounded-xl transition-colors duration-300"
              >
                Nous contacter
              </a>
              <Link
                href="/"
                className="inline-block border border-[#0F2044]/20 hover:border-[#0F2044]/40 text-[#0F2044] font-semibold px-8 py-3 rounded-xl transition-colors duration-300"
              >
                Retour a l’accueil
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
