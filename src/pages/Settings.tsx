import { useEffect } from "react";
import { usePreferences } from "../context/PreferencesContext";
import { useToast } from "../context/ToastContext";

export default function Settings() {
  const { prefs, setPrefs } = usePreferences();
  const { showSuccess } = useToast();

  useEffect(() => {
    if (prefs.reducedMotion) {
      document.documentElement.classList.add("reduce-motion");
    } else {
      document.documentElement.classList.remove("reduce-motion");
    }
  }, [prefs.reducedMotion]);

  return (
    <div className="space-y-8 max-w-2xl">
      <header>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="mt-2 text-stellar-text-secondary">
          Manage display and data preferences for Bridge Watch. Changes are saved automatically in this browser.
        </p>
      </header>

      <section
        className="rounded-xl border border-stellar-border bg-stellar-card p-6 space-y-6"
        aria-labelledby="settings-display-heading"
      >
        <h2 id="settings-display-heading" className="text-lg font-semibold text-white">
          Display
        </h2>

        <label className="flex items-center justify-between gap-4 cursor-pointer">
          <span className="text-stellar-text-secondary">
            Compact number format
            <span className="block text-xs mt-1 text-stellar-text-secondary/80">
              Prefer shorter numeric labels where the UI supports it.
            </span>
          </span>
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-stellar-border bg-stellar-dark text-stellar-blue focus:ring-stellar-blue"
            checked={prefs.compactNumbers}
            onChange={(e) => {
              setPrefs({ compactNumbers: e.target.checked });
              showSuccess("Preference saved.");
            }}
          />
        </label>

        <label className="flex items-center justify-between gap-4 cursor-pointer">
          <span className="text-stellar-text-secondary">
            Reduce motion
            <span className="block text-xs mt-1 text-stellar-text-secondary/80">
              Minimize animations for charts and loading states.
            </span>
          </span>
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-stellar-border bg-stellar-dark text-stellar-blue focus:ring-stellar-blue"
            checked={prefs.reducedMotion}
            onChange={(e) => {
              setPrefs({ reducedMotion: e.target.checked });
              showSuccess("Preference saved.");
            }}
          />
        </label>
      </section>

      <section
        className="rounded-xl border border-stellar-border bg-stellar-card p-6 space-y-4"
        aria-labelledby="settings-data-heading"
      >
        <h2 id="settings-data-heading" className="text-lg font-semibold text-white">
          Data refresh
        </h2>
        <p className="text-sm text-stellar-text-secondary">
          Target interval for live dashboards. The app aligns polling with this preference where possible.
        </p>
        <div className="flex flex-wrap gap-2">
          {(
            [
              { value: 30_000 as const, label: "30 seconds" },
              { value: 60_000 as const, label: "1 minute" },
              { value: 120_000 as const, label: "2 minutes" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                setPrefs({ dataRefreshMs: opt.value });
                showSuccess("Refresh interval updated.");
              }}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-stellar-blue focus:ring-offset-2 focus:ring-offset-stellar-card ${
                prefs.dataRefreshMs === opt.value
                  ? "bg-stellar-blue text-white"
                  : "bg-stellar-dark text-stellar-text-secondary hover:text-white border border-stellar-border"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
