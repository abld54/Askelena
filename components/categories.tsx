import Link from "next/link";

const categories = [
  {
    id: "peiniches",
    label: "Péniches",
    emoji: "⚓",
    description: "Vivez au fil de l'eau dans des péniches aménagées avec soin",
    count: 142,
    gradient: "from-blue-900 to-blue-700",
    accent: "#4A90D9",
  },
  {
    id: "chateaux",
    label: "Châteaux",
    emoji: "🏰",
    description: "Séjournez dans des demeures historiques chargées d'histoire",
    count: 87,
    gradient: "from-stone-800 to-stone-600",
    accent: "#8B7355",
  },
  {
    id: "phares",
    label: "Phares",
    emoji: "🔦",
    description: "Dormez au sommet d'un phare face à l'immensité de l'océan",
    count: 34,
    gradient: "from-teal-900 to-teal-700",
    accent: "#2DD4BF",
  },
  {
    id: "cabanes",
    label: "Cabanes",
    emoji: "🌲",
    description: "Nichées dans les arbres, des refuges en harmonie avec la forêt",
    count: 215,
    gradient: "from-green-900 to-green-700",
    accent: "#4ADE80",
  },
  {
    id: "yourtes",
    label: "Yourtes",
    emoji: "🏕️",
    description: "Découvrez le nomadisme luxueux sous une yourte authentique",
    count: 98,
    gradient: "from-orange-900 to-amber-700",
    accent: "#FBBF24",
  },
];

export function Categories() {
  return (
    <section id="categories" className="bg-[#FAF8F4] py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-[#C9A84C] text-xs font-semibold tracking-widest uppercase mb-3">
            Explorer par type
          </p>
          <h2
            className="text-4xl sm:text-5xl font-heading font-semibold text-[#0F2044] mb-4"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Trouvez votre lieu idéal
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-base leading-relaxed">
            Cinq univers uniques pour des séjours inoubliables, entre heritage,
            nature et authenticité.
          </p>
        </div>

        {/* Category grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`#${cat.id}`}
              className="group relative overflow-hidden rounded-2xl aspect-[3/4] flex flex-col justify-end p-5 cursor-pointer"
            >
              {/* Background gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-b ${cat.gradient} opacity-90 group-hover:opacity-100 transition-opacity duration-300`}
              />

              {/* Hover shine overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

              {/* Pattern overlay */}
              <div
                className="absolute inset-0 opacity-5"
                style={{
                  backgroundImage: `radial-gradient(circle at 70% 30%, ${cat.accent} 0%, transparent 60%)`,
                }}
              />

              {/* Content */}
              <div className="relative z-10">
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">
                  {cat.emoji}
                </div>
                <h3
                  className="text-white font-heading font-semibold text-lg leading-tight mb-1"
                  style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                >
                  {cat.label}
                </h3>
                <p className="text-white/60 text-xs leading-relaxed line-clamp-2 group-hover:text-white/80 transition-colors duration-200">
                  {cat.description}
                </p>
                <div
                  className="mt-2 text-xs font-medium"
                  style={{ color: cat.accent }}
                >
                  {cat.count} lieux
                </div>
              </div>

              {/* Bottom border accent */}
              <div
                className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ backgroundColor: cat.accent }}
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
