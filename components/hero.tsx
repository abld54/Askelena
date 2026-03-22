"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const popularSearches = ["Péniche Paris", "Château Loire", "Phare Bretagne", "Cabane dans les arbres"];

export function Hero() {
  const [search, setSearch] = useState("");

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "linear-gradient(135deg, #0F2044 0%, #1B3A6B 40%, #0F2044 70%, #0a1628 100%)",
        }}
      />

      {/* Decorative overlay pattern */}
      <div
        className="absolute inset-0 z-0 opacity-10"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 50%, #C9A84C 0%, transparent 50%), radial-gradient(circle at 80% 20%, #4A90D9 0%, transparent 40%)",
        }}
      />

      {/* Wave divider at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <svg
          viewBox="0 0 1440 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full"
          preserveAspectRatio="none"
        >
          <path
            d="M0 60 C360 100 1080 20 1440 60 L1440 100 L0 100 Z"
            fill="#FAF8F4"
          />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center pt-24 pb-32">
        {/* Tag line */}
        <div className="flex justify-center mb-6">
          <Badge
            className="bg-[#C9A84C]/20 text-[#C9A84C] border border-[#C9A84C]/40 text-xs px-4 py-1.5 font-medium tracking-widest uppercase"
          >
            Lieux d'exception
          </Badge>
        </div>

        {/* Heading */}
        <h1
          className="text-5xl sm:text-6xl md:text-7xl font-heading font-semibold text-white leading-tight mb-6"
          style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
        >
          Vivez une
          <span className="block text-[#C9A84C]">expérience unique</span>
        </h1>

        {/* Sub-heading */}
        <p className="text-white/70 text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
          Péniches flottantes, châteaux historiques, phares isolés, cabanes
          perchées ou yourtes en pleine nature — trouvez votre refuge
          d'exception.
        </p>

        {/* Search bar */}
        <div className="bg-white rounded-2xl shadow-2xl p-2 flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto">
          <div className="flex-1 relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Destination, type de lieu..."
              className="pl-10 border-none shadow-none text-gray-800 placeholder:text-gray-400 focus-visible:ring-0 text-sm h-12"
            />
          </div>

          <div className="hidden sm:block w-px bg-gray-200 my-2" />

          <div className="relative sm:w-48">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <Input
              placeholder="Dates"
              className="pl-10 border-none shadow-none text-gray-800 placeholder:text-gray-400 focus-visible:ring-0 text-sm h-12"
            />
          </div>

          <Button className="bg-[#0F2044] hover:bg-[#1B3A6B] text-white font-semibold px-8 h-12 rounded-xl text-sm transition-colors duration-200">
            Rechercher
          </Button>
        </div>

        {/* Popular searches */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <span className="text-white/50 text-xs">Populaire :</span>
          {popularSearches.map((s) => (
            <button
              key={s}
              onClick={() => setSearch(s)}
              className="text-white/70 hover:text-[#C9A84C] text-xs px-3 py-1 rounded-full border border-white/20 hover:border-[#C9A84C]/40 transition-all duration-200"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-sm mx-auto">
          {[
            { value: "1 200+", label: "Lieux uniques" },
            { value: "98%", label: "Satisfaction" },
            { value: "32", label: "Pays" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div
                className="text-2xl font-heading font-semibold text-[#C9A84C]"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
              >
                {stat.value}
              </div>
              <div className="text-white/50 text-xs mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
