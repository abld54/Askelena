"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const propertyLinks = [
  { label: "La Peniche", href: "/peniche", subtitle: "Neuilly-sur-Seine" },
  { label: "L\u2019Appartement", href: "/appartement", subtitle: "Courbevoie" },
];

interface UserSession {
  name?: string;
  email?: string;
  image?: string;
  role?: string;
}

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [bienOpen, setBienOpen] = useState(false);
  const [user, setUser] = useState<UserSession | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Fetch session on mount
  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  const isPropertyPage = pathname === "/peniche" || pathname === "/appartement";

  const navLinks = isPropertyPage
    ? [
        { label: "Nos biens", href: "/#properties", hasDropdown: true },
        { label: "Services", href: "/#services", hasDropdown: false },
        { label: "Proprietaires", href: "/louez-nous-vos-biens", hasDropdown: false },
        { label: "Avis", href: "/#reviews", hasDropdown: false },
        { label: "Contact", href: "/#contact", hasDropdown: false },
      ]
    : [
        { label: "Nos biens", href: "#properties", hasDropdown: true },
        { label: "Services", href: "#services", hasDropdown: false },
        { label: "Proprietaires", href: "/louez-nous-vos-biens", hasDropdown: false },
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
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
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
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
                >
                  {user.image ? (
                    <img src={user.image} alt="" className="w-8 h-8 rounded-full border border-white/20" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#C9A84C] flex items-center justify-center text-[#0F2044] font-semibold text-sm">
                      {(user.name || user.email || "?")[0].toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-medium">{user.name?.split(" ")[0]}</span>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-[#0F2044] border border-white/10 rounded-xl shadow-xl overflow-hidden">
                    {user.role === "host" && (
                      <Link
                        href="/admin"
                        className="block px-4 py-3 text-white/70 hover:text-white hover:bg-white/5 text-sm transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                    )}
                    <a
                      href="/api/auth/signout"
                      className="block px-4 py-3 text-white/70 hover:text-white hover:bg-white/5 text-sm transition-colors border-t border-white/5"
                    >
                      Se déconnecter
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <a
                href="/api/auth/signin/google"
                className="flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium tracking-wide transition-colors duration-300 border border-white/20 rounded-lg px-4 py-2 hover:border-white/40"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Connexion
              </a>
            )}
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
              {user ? (
                <div className="flex items-center gap-3 px-1 py-2 border-t border-white/10 mt-2">
                  {user.image ? (
                    <img src={user.image} alt="" className="w-8 h-8 rounded-full" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#C9A84C] flex items-center justify-center text-[#0F2044] font-semibold text-sm">
                      {(user.name || "?")[0].toUpperCase()}
                    </div>
                  )}
                  <span className="text-white text-sm font-medium">{user.name}</span>
                  <a href="/api/auth/signout" className="ml-auto text-white/40 hover:text-white/70 text-xs">
                    Déconnexion
                  </a>
                </div>
              ) : (
                <a
                  href="/api/auth/signin/google"
                  className="flex items-center justify-center gap-2 text-white/80 text-sm font-medium border border-white/20 rounded-lg px-4 py-2.5 mt-2 hover:border-white/40 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Connexion Google
                </a>
              )}
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
