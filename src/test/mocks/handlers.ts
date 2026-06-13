import { http, HttpResponse } from "msw";

export const handlers = [
  // Mock Assets
  http.get("/api/v1/assets", () => {
    return HttpResponse.json({
      assets: [
        { symbol: "XLM", name: "Stellar" },
        { symbol: "USDC", name: "USDC" },
      ],
      total: 2,
    });
  }),

  // Mock Asset Health
  http.get("/api/v1/assets/:symbol/health", ({ params }) => {
    return HttpResponse.json({
      symbol: params.symbol,
      overallScore: 85,
      factors: {
        liquidityDepth: 90,
        priceStability: 80,
        bridgeUptime: 100,
        reserveBacking: 85,
        volumeTrend: 70,
      },
      trend: "stable",
      lastUpdated: new Date().toISOString(),
    });
  }),

  // Mock Asset Price
  http.get("/api/v1/assets/:symbol/price", ({ params }) => {
    return HttpResponse.json({
      symbol: params.symbol,
      vwap: 0.1234,
      sources: [{ source: "Binance", price: 0.1235, timestamp: new Date().toISOString() }],
      deviation: 0.05,
      lastUpdated: new Date().toISOString(),
    });
  }),

  // Mock indexed search endpoint used by GlobalSearch / SearchModal autocomplete
  http.get("/api/v1/search", ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get("q") ?? "";

    const allResults = [
      {
        id: "xlm",
        type: "asset" as const,
        title: "XLM",
        description: "Stellar Lumens",
        relevanceScore: 1,
        highlights: ["XLM"],
        metadata: { symbol: "XLM" },
      },
      {
        id: "usdc",
        type: "asset" as const,
        title: "USDC",
        description: "USD Coin",
        relevanceScore: 0.9,
        highlights: ["USDC"],
        metadata: { symbol: "USDC" },
      },
      {
        id: "stellar-bridge",
        type: "bridge" as const,
        title: "Stellar Bridge",
        description: "Cross-chain bridge for Stellar assets",
        relevanceScore: 0.8,
        highlights: ["Stellar"],
        metadata: {},
      },
    ];

    const q = query.toLowerCase();
    const results = q
      ? allResults.filter(
          (r) =>
            r.title.toLowerCase().includes(q) ||
            r.description.toLowerCase().includes(q)
        )
      : [];

    return HttpResponse.json({
      success: true,
      data: { results, total: results.length },
    });
  }),

  // Mock External Dependencies (Service Health)
  http.get("/api/v1/external-dependencies", () => {
    return HttpResponse.json({
      dependencies: [
        {
          providerKey: "horizon",
          displayName: "Horizon API",
          category: "blockchain",
          endpoint: "https://horizon.stellar.org",
          checkType: "http",
          latencyWarningMs: 1000,
          latencyCriticalMs: 3000,
          failureThreshold: 3,
          maintenanceMode: false,
          maintenanceNote: null,
          status: "healthy",
          lastCheckedAt: new Date().toISOString(),
          lastLatencyMs: 250,
          consecutiveFailures: 0,
          lastSuccessAt: new Date().toISOString(),
          lastFailureAt: null,
          lastError: null,
          alertState: "none",
        },
        {
          providerKey: "circle",
          displayName: "Circle API",
          category: "price",
          endpoint: "https://api.circle.com",
          checkType: "http",
          latencyWarningMs: 2000,
          latencyCriticalMs: 5000,
          failureThreshold: 3,
          maintenanceMode: false,
          maintenanceNote: null,
          status: "healthy",
          lastCheckedAt: new Date().toISOString(),
          lastLatencyMs: 180,
          consecutiveFailures: 0,
          lastSuccessAt: new Date().toISOString(),
          lastFailureAt: null,
          lastError: null,
          alertState: "none",
        },
      ],
      summary: {
        healthy: 2,
        degraded: 0,
        down: 0,
        maintenance: 0,
        unknown: 0,
      },
    });
  }),
];
