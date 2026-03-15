interface HealthScoreCardProps {
  symbol: string;
  overallScore: number | null;
  factors: {
    liquidityDepth: number;
    priceStability: number;
    bridgeUptime: number;
    reserveBacking: number;
    volumeTrend: number;
  } | null;
  trend: "improving" | "stable" | "deteriorating" | null;
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-400";
  if (score >= 60) return "text-yellow-400";
  if (score >= 40) return "text-orange-400";
  return "text-red-400";
}

function getTrendLabel(trend: string | null): string {
  if (trend === "improving") return "Improving";
  if (trend === "deteriorating") return "Deteriorating";
  return "Stable";
}

export default function HealthScoreCard({
  symbol,
  overallScore,
  factors,
  trend,
}: HealthScoreCardProps) {
  if (overallScore === null || factors === null) {
    return (
      <div className="bg-stellar-card border border-stellar-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-2">{symbol} Health</h3>
        <p className="text-stellar-text-secondary">No health data available</p>
      </div>
    );
  }

  return (
    <div className="bg-stellar-card border border-stellar-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{symbol} Health</h3>
        <span className="text-sm text-stellar-text-secondary">
          {getTrendLabel(trend)}
        </span>
      </div>

      <div className="text-center mb-6">
        <span className={`text-5xl font-bold ${getScoreColor(overallScore)}`}>
          {overallScore}
        </span>
        <span className="text-stellar-text-secondary text-sm ml-1">/100</span>
      </div>

      <div className="space-y-3">
        {Object.entries(factors).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-sm text-stellar-text-secondary capitalize">
              {key.replace(/([A-Z])/g, " $1").trim()}
            </span>
            <div className="flex items-center space-x-2">
              <div className="w-24 h-2 bg-stellar-border rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    value >= 80
                      ? "bg-green-400"
                      : value >= 60
                        ? "bg-yellow-400"
                        : value >= 40
                          ? "bg-orange-400"
                          : "bg-red-400"
                  }`}
                  style={{ width: `${value}%` }}
                />
              </div>
              <span className="text-sm text-white w-8 text-right">{value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
