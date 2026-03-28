import { useEffect, useId, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { SkeletonText } from "./Skeleton";
import NotificationCenter from "./NotificationCenter";
import { WatchlistSidebar } from "./WatchlistSidebar";
import { useNotificationContext } from "../hooks/useNotificationContext";

const navLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/bridges", label: "Bridges" },
  { to: "/transactions", label: "Transactions" },
  { to: "/analytics", label: "Analytics" },
  { to: "/liquidity", label: "Liquidity" },
  { to: "/watchlist", label: "Watchlist" },
  { to: "/reports", label: "Reports" },
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
      : "text-stellar-text-secondary hover:text-stellar-text-primary"
  } focus:outline-none focus:ring-2 focus:ring-stellar-blue focus:ring-offset-2 focus:ring-offset-stellar-card`;
}

export default function Navbar({ isLoading = false }: NavbarProps) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isWatchlistOpen, setIsWatchlistOpen] = useState(false);
  const { unreadCount } = useNotificationContext();
  const navRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isLoading) {
    return (
      <nav className="border-b border-stellar-border bg-stellar-card px-4 py-3" aria-label="Primary loading navigation">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <SkeletonText width="110px" height="1rem" variant="title" />
            <div className="hidden md:flex gap-2">
              {Array.from({ length: 9 }).map((_, i) => (
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
    <nav
      className="border-b border-stellar-border bg-stellar-card sticky top-0 z-50"
      aria-label="Primary"
      ref={navRef}
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-stellar-card focus:px-3 focus:py-2 focus:text-stellar-text-primary focus:outline-none focus:ring-2 focus:ring-stellar-blue"
      >
        Skip to content
      </a>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          <div className="flex items-center min-w-0 flex-1 md:flex-initial md:space-x-8">
            <Link
              to="/"
              className="text-xl font-bold text-stellar-text-primary shrink-0 focus:outline-none focus:ring-2 focus:ring-stellar-blue focus:ring-offset-2 focus:ring-offset-stellar-card rounded-sm"
              aria-label="Bridge Watch home"
            >
              Bridge <span className="text-stellar-blue">Watch</span>
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

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setIsWatchlistOpen(true)}
              className="p-2 rounded-full transition-colors relative focus:outline-none focus:ring-2 focus:ring-stellar-blue text-stellar-text-secondary hover:text-white"
              aria-label="Open Watchlist"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </button>
            <WatchlistSidebar isOpen={isWatchlistOpen} onClose={() => setIsWatchlistOpen(false)} />

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className={`p-2 rounded-full transition-colors relative focus:outline-none focus:ring-2 focus:ring-stellar-blue ${
                  isNotifOpen ? "bg-stellar-dark text-white" : "text-stellar-text-secondary hover:text-white"
                }`}
                aria-label={`${unreadCount} notifications`}
                aria-expanded={isNotifOpen}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 block h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center border-2 border-stellar-card">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              <NotificationCenter isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
            </div>

            <div className="hidden lg:block text-sm text-stellar-text-secondary border-l border-stellar-border pl-4 max-w-[10rem] xl:max-w-none truncate">
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
