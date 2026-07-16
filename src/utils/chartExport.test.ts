import { describe, expect, it } from "vitest";
import { buildAnomalyTrendCsv, buildExportFilename } from "./chartExport";

describe("chartExport utilities", () => {
  it("includes active filters and series in CSV output", () => {
    const csv = buildAnomalyTrendCsv(
      {
        trendPoints: [
          { date: "2026-07-15", low: 1, medium: 2, high: 3, critical: 4, total: 10 },
        ],
        totalEvents: 10,
        bySeverity: { low: 1, medium: 2, high: 3, critical: 4 },
        byAsset: { USDC: 10 },
      },
      {
        assetCode: "USDC",
        days: 30,
        chartName: "Anomaly Trends",
      }
    );

    expect(csv).toContain("Chart Name,Anomaly Trends");
    expect(csv).toContain("Asset,USDC");
    expect(csv).toContain("Time Range,Last 30 days");
    expect(csv).toContain("Date,Low,Medium,High,Critical,Total");
    expect(csv).toContain("2026-07-15,1,2,3,4,10");
  });

  it("builds a timestamped filename with a safe chart label", () => {
    const filename = buildExportFilename("Anomaly Trends", "csv", "2026-07-15T12:35:00.000Z");

    expect(filename).toBe("anomaly-trends-2026-07-15T12-35-00-000Z.csv");
  });
});
