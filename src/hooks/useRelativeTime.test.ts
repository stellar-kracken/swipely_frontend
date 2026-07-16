import { describe, expect, it } from "vitest";
import {
  formatRelativeTime,
  getRelativeTimeBucket,
  toMillis,
} from "./useRelativeTime";

describe("toMillis", () => {
  it("parses Date, number, ISO string, and rejects invalid values", () => {
    const now = Date.parse("2026-07-16T12:00:00.000Z");
    expect(toMillis(new Date(now))).toBe(now);
    expect(toMillis(now)).toBe(now);
    expect(toMillis("2026-07-16T12:00:00.000Z")).toBe(now);
    expect(toMillis(null)).toBeNull();
    expect(toMillis(undefined)).toBeNull();
    expect(toMillis("not-a-date")).toBeNull();
    expect(toMillis(Number.NaN)).toBeNull();
  });
});

describe("getRelativeTimeBucket", () => {
  const now = Date.parse("2026-07-16T12:00:00.000Z");

  it("returns never for missing timestamps", () => {
    expect(getRelativeTimeBucket(null, now)).toEqual({ type: "never" });
  });

  it("buckets ages into justNow / seconds / minutes / hours / days", () => {
    expect(getRelativeTimeBucket(now - 2_000, now)).toEqual({ type: "justNow" });
    expect(getRelativeTimeBucket(now - 12_000, now)).toEqual({
      type: "seconds",
      count: 12,
    });
    expect(getRelativeTimeBucket(now - 5 * 60_000, now)).toEqual({
      type: "minutes",
      count: 5,
    });
    expect(getRelativeTimeBucket(now - 3 * 3_600_000, now)).toEqual({
      type: "hours",
      count: 3,
    });
    expect(getRelativeTimeBucket(now - 2 * 86_400_000, now)).toEqual({
      type: "days",
      count: 2,
    });
  });
});

describe("formatRelativeTime", () => {
  const now = Date.parse("2026-07-16T12:00:00.000Z");

  it("formats short English relative strings", () => {
    expect(formatRelativeTime(null, now)).toBe("never");
    expect(formatRelativeTime(now - 1_000, now)).toBe("just now");
    expect(formatRelativeTime(now - 12_000, now)).toBe("12s ago");
    expect(formatRelativeTime(now - 3 * 60_000, now)).toBe("3m ago");
    expect(formatRelativeTime(now - 2 * 3_600_000, now)).toBe("2h ago");
    expect(formatRelativeTime(now - 4 * 86_400_000, now)).toBe("4d ago");
  });
});
