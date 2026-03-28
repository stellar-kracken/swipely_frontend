import { useEffect, useId, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { SkeletonText } from "./Skeleton";

const navLinks = [
  { to: "/", label: "Dashboard" },
  { to: "/bridges", label: "Bridges" },
  { to: "/transactions", label: "Transactions" },
  { to: "/analytics", label: "Analytics" },
  { to: "/status", label: "Status" },
  { to: "/settings", label: "Settings" },
];

interface NavbarProps {
  isLoading?: boolean;
}

function linkClass(active: boolean) {
  return `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
    active
      ? "bg-stellar-blue text-white"
      : "text-stellar-text-secondary hover:text-white"
  } focus:outline-none focus:ring-2 focus:ring-stellar-blue focus:ring-offset-2 focus:ring-offset-stellar-card`;
}

export default function Navbar({ isLoading = false }: NavbarProps) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  if (isLoading) {
    return (
      <nav className="border-b border-stellar-border bg-stellar-card px-4 py-3" aria-label="Primary loading navigation">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <SkeletonText width="110px" height="1rem" variant="title" />
            <div className="hidden md:flex gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonText key={i} width="70px" height="1rem" variant="text" />
              ))}
            </div>
          </div>
          <SkeletonText width="36px" height="2.25rem" variant="text" className="md:hidden rounded-md" />
        </div>
      </nav>
    );
  }

  return (
    <nav className="relative z-50 border-b border-stellar-border bg-stellar-card" aria-label="Primary">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-stellar-card focus:px-3 focus:py-2 focus:text-white focus:outline-none focus:ring-2 focus:ring-stellar-blue"
      >
        Skip to content
      </a>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          <div className="flex items-center min-w-0 flex-1 md:flex-initial md:space-x-8">
            <Link
              to="/"
              className="text-xl font-bold text-white shrink-0 focus:outline-none focus:ring-2 focus:ring-stellar-blue focus:ring-offset-2 focus:ring-offset-stellar-card rounded-sm"
              aria-label="Bridge Watch home"
            >
              Bridge Watch
            </Link>
            <div className="hidden md:flex flex-wrap gap-1 lg:gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  aria-current={location.pathname === link.to ? "page" : undefined}
                  className={linkClass(location.pathname === link.to)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden sm:block text-sm text-stellar-text-secondary max-w-[10rem] lg:max-w-none truncate">
              Stellar Network Monitor
            </div>
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-stellar-text-secondary hover:bg-white/5 hover:text-white focus:outline-none focus:ring-2 focus:ring-stellar-blue focus:ring-offset-2 focus:ring-offset-stellar-card"
              aria-expanded={menuOpen}
              aria-controls={menuId}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((o) => !o)}
            >
              <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
              {menuOpen ? (
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/60 md:hidden"
            aria-label="Close navigation menu"
            onClick={() => setMenuOpen(false)}
          />
          <div
            id={menuId}
            className="fixed top-16 bottom-0 right-0 z-50 w-[min(100%,20rem)] border-l border-stellar-border bg-stellar-card shadow-xl md:hidden flex flex-col py-6 px-4"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
          >
            <div className="flex flex-col gap-1 overflow-y-auto">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  aria-current={location.pathname === link.to ? "page" : undefined}
                  className={`${linkClass(location.pathname === link.to)} text-base`}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <p className="mt-auto pt-6 text-xs text-stellar-text-secondary border-t border-stellar-border">
              Stellar Network Monitor
            </p>
          </div>
        </>
      )}
    </nav>
  );
}
