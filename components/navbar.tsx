"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const propertyLinks = [
  { label: "La Peniche", href: "/peniche", subtitle: "Neuilly-sur-Seine" },
  { label: "L\u2019Appartement", href: "/appartement", subtitle: "Courbevoie" },
];

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [bienOpen, setBienOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const isPropertyPage = pathname === "/peniche" || pathname === "/appartement";

  const navLinks = isPropertyPage
    ? [
        { label: "Nos biens", href: "/#properties", hasDropdown: true },
        { label: "Services", href: "/#services", hasDropdown: false },
        { label: "Avis", href: "/#reviews", hasDropdown: false },
        { label: "Contact", href: "/#contact", hasDropdown: false },
      ]
    : [
        { label: "Nos biens", href: "#properties", hasDropdown: true },
        { label: "Services", href: "#services", hasDropdown: false },
        { label: "Avis", href: "#reviews", hasDropdown: false },
        { label: "Contact", href: "#contact", hasDropdown: false },
      ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setBienOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#0F2044]/98 backdrop-blur-md shadow-lg"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span
              className="text-2xl font-semibold text-white tracking-wide"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              Askelena
            </span>
            <span className="text-[#C9A84C] text-xl">✦</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) =>
              link.hasDropdown ? (
                <div key={link.label} className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setBienOpen(!bienOpen)}
                    className="text-white/70 hover:text-[#C9A84C] text-sm font-medium tracking-wide transition-colors duration-300 flex items-center gap-1"
                  >
                    {link.label}
                    <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${bienOpen ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                  {bienOpen && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-56 bg-[#0F2044] border border-white/10 rounded-xl shadow-xl overflow-hidden">
                      {propertyLinks.map((prop) => (
                        <Link
                          key={prop.href}
                          href={prop.href}
                          className={`block px-5 py-3 hover:bg-white/5 transition-colors ${pathname === prop.href ? "bg-white/5" : ""}`}
                          onClick={() => setBienOpen(false)}
                        >
                          <span className="text-white text-sm font-medium">{prop.label}</span>
                          <span className="block text-white/40 text-xs mt-0.5">{prop.subtitle}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-white/70 hover:text-[#C9A84C] text-sm font-medium tracking-wide transition-colors duration-300"
                >
                  {link.label}
                </Link>
              )
            )}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center">
            <Link
              href={isPropertyPage ? "#booking" : "/peniche#booking"}
              className="bg-[#C9A84C] hover:bg-[#E5C158] text-[#0F2044] font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors duration-300"
            >
              Reserver
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <div className="w-6 flex flex-col gap-1.5">
              <span
                className={`block h-0.5 bg-white transition-all duration-300 ${
                  menuOpen ? "rotate-45 translate-y-2" : ""
                }`}
              />
              <span
                className={`block h-0.5 bg-white transition-all duration-300 ${
                  menuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block h-0.5 bg-white transition-all duration-300 ${
                  menuOpen ? "-rotate-45 -translate-y-2" : ""
                }`}
              />
            </div>
          </button>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ${
            menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="py-4 border-t border-white/10">
            <div className="flex flex-col gap-4">
              {/* Properties section */}
              <div className="px-1">
                <span className="text-[#C9A84C] text-xs font-semibold tracking-widest uppercase">Nos biens</span>
                <div className="mt-2 flex flex-col gap-2 pl-3">
                  {propertyLinks.map((prop) => (
                    <Link
                      key={prop.href}
                      href={prop.href}
                      className="text-white/70 hover:text-[#C9A84C] text-sm font-medium tracking-wide transition-colors duration-300"
                      onClick={() => setMenuOpen(false)}
                    >
                      {prop.label}
                      <span className="text-white/30 text-xs ml-2">{prop.subtitle}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {navLinks.filter(l => !l.hasDropdown).map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-white/70 hover:text-[#C9A84C] text-sm font-medium tracking-wide transition-colors duration-300 px-1"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href={isPropertyPage ? "#booking" : "/peniche#booking"}
                className="bg-[#C9A84C] hover:bg-[#E5C158] text-[#0F2044] font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors duration-300 text-center mt-2"
                onClick={() => setMenuOpen(false)}
              >
                Reserver
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
