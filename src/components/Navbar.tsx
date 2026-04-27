import { Link, useLocation } from "react-router-dom";
import { useWatchlist } from "../hooks/useWatchlist";

const navLinks = [
  { to: "/", label: "Dashboard" },
  { to: "/bridges", label: "Bridges" },
  { to: "/analytics", label: "Analytics" },
  { to: "/watchlists", label: "Watchlists" },
];

export default function Navbar() {
  const location = useLocation();
  const { activeSymbols } = useWatchlist();

  return (
    <nav className="border-b border-stellar-border bg-stellar-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-bold text-white">
              Bridge Watch
            </Link>
            <div className="hidden md:flex space-x-4">
              {desktopLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActiveRoute(link.to)
                      ? "bg-stellar-blue text-white"
                      : "text-stellar-text-secondary hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-2 text-xs text-stellar-text-secondary">
            <span>Quick:</span>
            {activeSymbols.length === 0 ? (
              <span>No watchlist assets</span>
            ) : (
              activeSymbols.slice(0, 3).map((symbol) => (
                <Link
                  key={symbol}
                  to={`/assets/${symbol}`}
                  className="rounded border border-stellar-border px-2 py-1 hover:text-white"
                >
                  {symbol}
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {isMobileOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          role="presentation"
        >
          <button
            ref={firstFocusableRef}
            onClick={() => setIsMobileOpen(false)}
            className="absolute inset-0 h-full w-full bg-black/45"
            aria-label="Close mobile menu overlay"
          />
          <div
            id="mobile-nav-panel"
            ref={mobilePanelRef}
            onTouchStart={handleMobileTouchStart}
            onTouchMove={handleMobileTouchMove}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation menu"
            className="absolute right-0 top-0 h-full w-80 max-w-[88vw] overflow-y-auto border-l border-stellar-border bg-stellar-card p-5 shadow-xl transition-transform duration-300"
          >
            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-wide text-stellar-text-secondary">
                Navigation
              </p>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="rounded-md p-2 text-stellar-text-secondary hover:bg-stellar-dark hover:text-white focus:outline-none focus:ring-2 focus:ring-stellar-blue"
                aria-label="Close mobile navigation menu"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <nav className="space-y-5" aria-label="Mobile primary navigation">
              {navGroups.map((group) => (
                <div key={group.label} className="space-y-2">
                  <p className="text-xs uppercase tracking-wide text-stellar-text-secondary">{group.label}</p>
                  <div className="space-y-1">
                    {group.links.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        aria-current={isActiveRoute(link.to) ? "page" : undefined}
                        className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                          isActiveRoute(link.to)
                            ? "bg-stellar-blue text-white"
                            : "text-stellar-text-secondary hover:bg-stellar-dark hover:text-white"
                        } focus:outline-none focus:ring-2 focus:ring-stellar-blue`}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </nav>

            <div className="mt-6 space-y-3 border-t border-stellar-border pt-4">
              <div className="rounded-lg bg-stellar-dark p-3">
                <p className="text-xs uppercase tracking-wide text-stellar-text-secondary">Account</p>
                <p className="mt-1 text-sm font-semibold text-white">@operator.dimka</p>
                <p className="text-xs text-stellar-text-secondary">Incident Commander</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setIsWatchlistOpen(true);
                    setIsMobileOpen(false);
                  }}
                  className="rounded-md border border-stellar-border bg-stellar-dark px-3 py-2 text-sm text-white transition hover:border-stellar-blue focus:outline-none focus:ring-2 focus:ring-stellar-blue"
                >
                  Watchlist
                </button>
                <Link
                  to="/reports"
                  className="rounded-md border border-stellar-border bg-stellar-dark px-3 py-2 text-center text-sm text-white transition hover:border-stellar-blue focus:outline-none focus:ring-2 focus:ring-stellar-blue"
                >
                  Reports
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
