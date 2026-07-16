import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CommandAction, actionsRegistry } from "../utils/commandRegistry";

const STORAGE_KEY = "swipely:recent_actions";

function fuzzyScore(q: string, text: string) {
  if (!q) return 1;
  q = q.toLowerCase();
  text = text.toLowerCase();
  if (text.includes(q)) return 1 + q.length / text.length;
  const tokens = text.split(/\s+/);
  return tokens.reduce((acc, t) => acc + (t.startsWith(q) ? 0.5 : 0), 0);
}

// ---------------------------------------------------------------------------
// Focus-trap hook
// Keeps keyboard focus inside `containerRef` while `enabled` is true.
// ---------------------------------------------------------------------------
function useFocusTrap(containerRef: React.RefObject<HTMLElement | null>, enabled: boolean) {
  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const el = containerRef.current;
    const focusable = () =>
      Array.from<HTMLElement>(
        el.querySelectorAll(
          'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])',
        ),
      );

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      const items = focusable();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [containerRef, enabled]);
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function CommandPalette() {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const [recent, setRecent] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Refs for accessibility / focus management
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  // Remember which element had focus before the palette was opened
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Stable IDs for ARIA
  const baseId = useId();
  const inputId = `${baseId}-input`;
  const listboxId = `${baseId}-listbox`;
  const optionId = (index: number) => `${baseId}-option-${index}`;
  const statusId = `${baseId}-status`;

  // Focus trap while open
  useFocusTrap(dialogRef, open);

  // ---------------------------------------------------------------------------
  // Open / close helpers
  // ---------------------------------------------------------------------------
  function openPalette() {
    previousFocusRef.current = document.activeElement as HTMLElement;
    setOpen(true);
    setQuery("");
    setActiveIndex(0);
  }

  function closePalette() {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
    // Restore focus to the element that was focused before the palette opened
    requestAnimationFrame(() => {
      previousFocusRef.current?.focus();
    });
  }

  // ---------------------------------------------------------------------------
  // Global Cmd+K / Ctrl+K toggle
  // ---------------------------------------------------------------------------
  useEffect(() => {
    function handleGlobalKey(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (open) {
          closePalette();
        } else {
          openPalette();
        }
      }
    }
    window.addEventListener("keydown", handleGlobalKey);
    return () => window.removeEventListener("keydown", handleGlobalKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Focus the input when the palette opens
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // ---------------------------------------------------------------------------
  // Filtered / ranked items
  // ---------------------------------------------------------------------------
  const items = useMemo(() => {
    const q = query.trim();
    const pool = [...actionsRegistry];
    pool.sort((a, b) => {
      const sa = fuzzyScore(q, `${a.title} ${(a.keywords || []).join(" ")}`);
      const sb = fuzzyScore(q, `${b.title} ${(b.keywords || []).join(" ")}`);
      return sb - sa;
    });
    // When a query is present, only keep items that actually scored > 0
    if (q) {
      return pool
        .filter((a) => fuzzyScore(q, `${a.title} ${(a.keywords || []).join(" ")}`) > 0)
        .slice(0, 20);
    }
    return pool.slice(0, 20);
  }, [query]);

  const visibleItems: CommandAction[] =
    query.trim() === ""
      ? recent
          .map((id) => actionsRegistry.find((a) => a.id === id))
          .filter((a): a is CommandAction => Boolean(a))
      : items;

  // Reset active index when the list changes
  useEffect(() => {
    setActiveIndex(0);
  }, [visibleItems.length, query]);

  // Scroll active option into view (scrollIntoView is not available in jsdom)
  useEffect(() => {
    if (!listboxRef.current) return;
    const activeEl = listboxRef.current.querySelector<HTMLElement>(
      `[id="${optionId(activeIndex)}"]`,
    );
    if (activeEl && typeof activeEl.scrollIntoView === "function") {
      activeEl.scrollIntoView({ block: "nearest" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  // ---------------------------------------------------------------------------
  // Recent actions management
  // ---------------------------------------------------------------------------
  function addRecent(id: string) {
    const next = [id, ...recent.filter((r) => r !== id)].slice(0, 10);
    setRecent(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore storage failures in private browsing or quota-limited contexts.
    }
  }

  // ---------------------------------------------------------------------------
  // Execute an action
  // ---------------------------------------------------------------------------
  function execute(action: CommandAction) {
    addRecent(action.id);
    closePalette();
    if (action.onExecute) {
      action.onExecute();
    } else if (action.href) {
      navigate(action.href);
    }
  }

  // ---------------------------------------------------------------------------
  // Keyboard handling inside the palette
  // ---------------------------------------------------------------------------
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, visibleItems.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (visibleItems[activeIndex]) {
          execute(visibleItems[activeIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        closePalette();
        break;
      default:
        break;
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  if (!open) return null;

  const showRecentLabel = recent.length > 0 && query.trim() === "";
  const resultCount = visibleItems.length;
  const activeDescendant =
    visibleItems.length > 0 ? optionId(activeIndex) : undefined;

  // Announcement text for screen readers
  const announcement =
    resultCount === 0
      ? "No results found"
      : `${resultCount} result${resultCount === 1 ? "" : "s"} available`;

  return (
    // Backdrop + dialog container
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4"
      // Keyboard users dismissing via Esc is handled in the input handler;
      // clicking the backdrop dismisses for pointer users.
      onClick={(e) => {
        if (e.target === e.currentTarget) closePalette();
      }}
    >
      {/* Semi-transparent backdrop – not interactive for AT */}
      <div
        className="absolute inset-0 bg-black/60"
        aria-hidden="true"
        onClick={closePalette}
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        aria-describedby={statusId}
        className="relative w-full max-w-xl bg-stellar-card border border-stellar-border rounded-xl shadow-2xl overflow-hidden"
        // Prevent backdrop click from also firing
        onClick={(e) => e.stopPropagation()}
      >
        {/* Combobox input */}
        <div className="px-4 py-3" role="search">
          <input
            ref={inputRef}
            id={inputId}
            type="search"
            role="combobox"
            aria-autocomplete="list"
            aria-controls={listboxId}
            aria-activedescendant={activeDescendant}
            aria-expanded={visibleItems.length > 0}
            aria-label="Search commands"
            autoComplete="off"
            spellCheck={false}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search…"
            className="w-full bg-transparent text-stellar-text-primary py-2 outline-none"
          />
        </div>

        {/* Live region for result count announcements */}
        <div
          id={statusId}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          {announcement}
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {showRecentLabel && (
            <div
              className="px-3 py-2 text-xs text-stellar-text-secondary"
              aria-hidden="true"
            >
              Recent
            </div>
          )}

          <ul
            ref={listboxRef}
            id={listboxId}
            role="listbox"
            aria-label={showRecentLabel ? "Recent commands" : "Command results"}
          >
            {visibleItems.map((action, index) => {
              const isActive = index === activeIndex;
              return (
                <li
                  key={action.id}
                  id={optionId(index)}
                  role="option"
                  aria-selected={isActive}
                  className={`px-3 py-2 cursor-pointer transition-colors ${
                    isActive
                      ? "bg-stellar-border/60"
                      : "hover:bg-stellar-border/40"
                  }`}
                  // Allow mouse clicks and touch
                  onClick={() => execute(action)}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  <div className="text-sm text-stellar-text-primary">
                    {action.title}
                  </div>
                  {action.href && (
                    <div className="text-xs text-stellar-text-secondary">
                      {action.href}
                    </div>
                  )}
                </li>
              );
            })}

            {visibleItems.length === 0 && (
              <li
                role="option"
                aria-selected={false}
                aria-disabled="true"
                className="px-3 py-4 text-sm text-stellar-text-secondary text-center select-none"
              >
                No results
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
