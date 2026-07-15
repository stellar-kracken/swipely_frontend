import type { AnomalyTrendData } from "../hooks/useAnomalyTrends";

export interface AnomalyTrendExportOptions {
  assetCode?: string;
  days?: number;
  chartName?: string;
}

function escapeCsvValue(value: unknown): string {
  const normalized = String(value ?? "");
  if (normalized.includes(",") || normalized.includes("\"") || normalized.includes("\n")) {
    return `"${normalized.replace(/"/g, '""')}"`;
  }
  return normalized;
}

function formatTimeRangeLabel(days: number): string {
  if (days <= 1) return "Last 24 hours";
  if (days <= 7) return `Last ${days} days`;
  return `Last ${days} days`;
}

export function buildAnomalyTrendCsv(
  trendData: AnomalyTrendData,
  options: AnomalyTrendExportOptions = {}
): string {
  const rows = [
    ["Chart Name", options.chartName ?? "Anomaly Trends"],
    ["Asset", options.assetCode || "All assets"],
    ["Time Range", formatTimeRangeLabel(options.days ?? 30)],
    ["Exported At", new Date().toISOString()],
    [],
    ["Date", "Low", "Medium", "High", "Critical", "Total"],
    ...trendData.trendPoints.map((point) => [
      point.date,
      point.low,
      point.medium,
      point.high,
      point.critical,
      point.total,
    ]),
  ];

  return rows.map((row) => row.map(escapeCsvValue).join(",")).join("\n");
}

export function buildExportFilename(chartName: string, extension: string, timestamp = new Date().toISOString()) {
  const baseName = chartName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "chart";

  const normalizedTimestamp = timestamp
    .replace(/:/g, "-")
    .replace(/\./g, "-")
    .replace(/T/g, "T");

  return `${baseName}-${normalizedTimestamp}.${extension}`;
}

export function triggerDownload(content: Blob | string, filename: string, mimeType = "application/octet-stream") {
  const blob = typeof content === "string" ? new Blob([content], { type: mimeType }) : content;
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function exportSvgToPng(svg: SVGSVGElement, chartName: string) {
  const serializer = new XMLSerializer();
  const source = serializer.serializeToString(svg);
  const svgBlob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
  const svgUrl = URL.createObjectURL(svgBlob);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Failed to load chart SVG"));
      img.src = svgUrl;
    });

    const rect = svg.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width || svg.clientWidth || 800));
    const height = Math.max(1, Math.round(rect.height || svg.clientHeight || 400));
    const scale = 2;

    const canvas = document.createElement("canvas");
    canvas.width = width * scale;
    canvas.height = height * scale;

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Unable to create canvas context");
    }

    context.scale(scale, scale);
    context.drawImage(image, 0, 0, width, height);

    const pngBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
          return;
        }
        reject(new Error("Unable to encode chart as PNG"));
      }, "image/png");
    });

    triggerDownload(pngBlob, buildExportFilename(chartName, "png"));
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}
