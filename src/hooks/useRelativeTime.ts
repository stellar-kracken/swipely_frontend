import { useEffect, useMemo, useState } from "react";

export type TimestampInput = Date | string | number | null | undefined;

export type RelativeTimeBucket =
  | { type: "never" }
  | { type: "justNow" }
  | { type: "seconds"; count: number }
  | { type: "minutes"; count: number }
  | { type: "hours"; count: number }
  | { type: "days"; count: number };

export function toMillis(timestamp: TimestampInput): number | null {
  if (timestamp === null || timestamp === undefined) return null;
  if (timestamp instanceof Date) {
    return Number.isNaN(timestamp.getTime()) ? null : timestamp.getTime();
  }
  if (typeof timestamp === "number") {
    return Number.isNaN(timestamp) ? null : timestamp;
  }
  const parsed = new Date(timestamp).getTime();
  return Number.isNaN(parsed) ? null : parsed;
}

/**
 * Bucket a timestamp into a relative-time unit for formatting (localized or plain).
 */
export function getRelativeTimeBucket(
  timestamp: TimestampInput,
  now = Date.now(),
): RelativeTimeBucket {
  const millis = toMillis(timestamp);
  if (millis === null) return { type: "never" };

  const diff = Math.max(0, now - millis);
  const seconds = Math.floor(diff / 1000);
  if (seconds < 5) return { type: "justNow" };
  if (seconds < 60) return { type: "seconds", count: seconds };

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return { type: "minutes", count: minutes };

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return { type: "hours", count: hours };

  const days = Math.floor(hours / 24);
  return { type: "days", count: days };
}

/**
 * Format the gap between `now` and a timestamp as a short, human relative string
 * such as "just now", "5s ago", "3m ago", "2h ago", or "4d ago".
 */
export function formatRelativeTime(timestamp: TimestampInput, now = Date.now()): string {
  const bucket = getRelativeTimeBucket(timestamp, now);
  switch (bucket.type) {
    case "never":
      return "never";
    case "justNow":
      return "just now";
    case "seconds":
      return `${bucket.count}s ago`;
    case "minutes":
      return `${bucket.count}m ago`;
    case "hours":
      return `${bucket.count}h ago`;
    case "days":
      return `${bucket.count}d ago`;
  }
}

/** Choose a re-render cadence proportional to the timestamp's age. */
function tickIntervalFor(ageMs: number): number {
  if (ageMs < 60_000) return 1_000; // under a minute → every second
  if (ageMs < 3_600_000) return 30_000; // under an hour → every 30s
  return 300_000; // older → every 5 minutes
}

interface UseRelativeTimeOptions {
  /** Treat the timestamp as stale once it is older than this. Defaults to 60s. */
  staleAfterMs?: number;
}

interface RelativeTimeResult {
  /** Human relative string, e.g. "5s ago". */
  text: string;
  /** Age of the timestamp in milliseconds (null when no valid timestamp). */
  ageMs: number | null;
  /** True when the timestamp is older than `staleAfterMs`. */
  isStale: boolean;
}

/**
 * Live relative-time value that re-renders on a cadence matched to the
 * timestamp's age, and reports whether the value has gone stale.
 */
export function useRelativeTime(
  timestamp: TimestampInput,
  { staleAfterMs = 60_000 }: UseRelativeTimeOptions = {},
): RelativeTimeResult {
  const millis = toMillis(timestamp);
  const [now, setNow] = useState(() => Date.now());

  const ageMs = millis === null ? null : Math.max(0, now - millis);

  useEffect(() => {
    if (millis === null) return;
    const interval = tickIntervalFor(Math.max(0, Date.now() - millis));
    const id = window.setInterval(() => setNow(Date.now()), interval);
    return () => window.clearInterval(id);
    // Re-evaluate the cadence as the value ages (now changes drive this).
  }, [millis, now]);

  return useMemo(
    () => ({
      text: formatRelativeTime(timestamp, now),
      ageMs,
      isStale: ageMs !== null && ageMs > staleAfterMs,
    }),
    [timestamp, now, ageMs, staleAfterMs],
  );
}
