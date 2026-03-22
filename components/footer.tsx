import Link from "next/link";
import { Separator } from "@/components/ui/separator";

const socialLinks = [
  {
    name: "Instagram",
    href: "#",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    name: "Facebook",
    href: "#",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    name: "Twitter/X",
    href: "#",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
];

export function Footer() {
  return (
    <footer id="contact" className="bg-[#0F2044] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        {/* Top section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span
                className="text-2xl font-semibold text-white tracking-wide"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
              >
                Askelena
              </span>
              <span className="text-[#C9A84C] text-xl">✦</span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs mb-6">
              Votre escapade flottante d&apos;exception sur le Canal
              Saint-Martin, au coeur de Paris.
            </p>
            {/* Social */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  aria-label={social.name}
                  className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-[#C9A84C] hover:border-[#C9A84C]/40 transition-all duration-300"
                >
                  {social.icon}
                </Link>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-[#C9A84C] text-xs font-semibold tracking-widest uppercase mb-4">
              Navigation
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="#about"
                  className="text-white/50 hover:text-white text-sm transition-colors duration-200"
                >
                  L&apos;experience
                </a>
              </li>
              <li>
                <a
                  href="#booking"
                  className="text-white/50 hover:text-white text-sm transition-colors duration-200"
                >
                  Tarifs et reservation
                </a>
              </li>
              <li>
                <a
                  href="#reviews"
                  className="text-white/50 hover:text-white text-sm transition-colors duration-200"
                >
                  Avis
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-[#C9A84C] text-xs font-semibold tracking-widest uppercase mb-4">
              Informations
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="#"
                  className="text-white/50 hover:text-white text-sm transition-colors duration-200"
                >
                  Mentions legales
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-white/50 hover:text-white text-sm transition-colors duration-200"
                >
                  Confidentialite
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-white/50 hover:text-white text-sm transition-colors duration-200"
                >
                  Nous contacter
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-10 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 min-w-0">
            <h4
              className="text-white font-semibold text-lg mb-1"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              Recevez nos offres exclusives
            </h4>
            <p className="text-white/50 text-sm">
              Soyez informe de nos disponibilites et offres speciales.
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <input
              type="email"
              placeholder="Votre email"
              className="flex-1 sm:w-56 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#C9A84C]/60"
            />
            <button className="bg-[#C9A84C] hover:bg-[#E5C158] text-[#0F2044] font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors duration-200 whitespace-nowrap">
              S&apos;inscrire
            </button>
          </div>
        </div>

        <Separator className="bg-white/10 mb-8" />

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-xs">
            &copy; 2026 Askelena. Tous droits reserves.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="#"
              className="text-white/40 hover:text-white/70 text-xs transition-colors duration-200"
            >
              Mentions legales
            </Link>
            <Link
              href="#"
              className="text-white/40 hover:text-white/70 text-xs transition-colors duration-200"
            >
              Confidentialite
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
