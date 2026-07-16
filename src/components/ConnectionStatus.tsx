import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { useWebSocketContext } from "../contexts/WebSocketContextValue";
import {
  getRelativeTimeBucket,
  toMillis,
  useRelativeTime,
  type RelativeTimeBucket,
  type TimestampInput,
} from "../hooks/useRelativeTime";
import { useLatestQueryUpdatedAt } from "../hooks/useLatestQueryUpdatedAt";
import type { ConnectionState } from "../types";

interface StateConfig {
  labelKey: string;
  dotColor: string;
  pulse: boolean;
}

const STATE_CONFIG: Record<ConnectionState, StateConfig> = {
  connected: { labelKey: "connection.live", dotColor: "bg-green-500", pulse: true },
  connecting: { labelKey: "connection.connecting", dotColor: "bg-yellow-500", pulse: true },
  disconnected: { labelKey: "connection.offline", dotColor: "bg-gray-500", pulse: false },
  error: { labelKey: "connection.error", dotColor: "bg-red-500", pulse: false },
};

export interface ConnectionStatusProps {
  /**
   * Explicit last-updated timestamp. When omitted, the latest TanStack Query
   * `dataUpdatedAt` from the query cache is used.
   */
  updatedAt?: TimestampInput;
}

function formatLocalizedRelative(
  bucket: RelativeTimeBucket,
  t: TFunction,
): string {
  switch (bucket.type) {
    case "never":
      return t("relativeTime.never");
    case "justNow":
      return t("time.justNow");
    case "seconds":
      return t("time.ago", { time: t("time.seconds", { count: bucket.count }) });
    case "minutes":
      return t("time.ago", { time: t("time.minutes", { count: bucket.count }) });
    case "hours":
      return t("time.ago", { time: t("time.hours", { count: bucket.count }) });
    case "days":
      return t("time.ago", { time: t("time.days", { count: bucket.count }) });
  }
}

/**
 * Small indicator that shows the current WebSocket connection state and a
 * live "last updated" relative timestamp. Must be rendered inside
 * <WebSocketProvider> and <QueryClientProvider> (when not passing updatedAt).
 */
export default function ConnectionStatus({ updatedAt }: ConnectionStatusProps = {}) {
  const { t, i18n } = useTranslation();
  const { connectionState, isPollingFallback } = useWebSocketContext();
  const queryUpdatedAt = useLatestQueryUpdatedAt();
  const resolvedUpdatedAt = updatedAt !== undefined ? updatedAt : queryUpdatedAt;

  const { ageMs } = useRelativeTime(resolvedUpdatedAt);
  const { labelKey, dotColor, pulse } = STATE_CONFIG[connectionState];
  const displayLabel = isPollingFallback ? t("connection.polling") : t(labelKey);

  const relativeLabel = useMemo(() => {
    // Recompute bucket from age so the label tracks the hook's ticking `now`.
    const now =
      ageMs === null || toMillis(resolvedUpdatedAt) === null
        ? Date.now()
        : toMillis(resolvedUpdatedAt)! + ageMs;
    const bucket = getRelativeTimeBucket(resolvedUpdatedAt, now);
    if (bucket.type === "never") {
      return t("connection.updatedNever");
    }
    return t("connection.updated", {
      relative: formatLocalizedRelative(bucket, t),
    });
  }, [resolvedUpdatedAt, ageMs, t]);

  const exactTimestamp = useMemo(() => {
    const millis = toMillis(resolvedUpdatedAt);
    if (millis === null) return null;
    return new Date(millis).toLocaleString(i18n.language);
  }, [resolvedUpdatedAt, i18n.language]);

  const exactTitle = exactTimestamp
    ? t("connection.exactTitle", { timestamp: exactTimestamp })
    : t("connection.updatedNever");

  const ariaLabel = t("connection.ariaLabel", {
    status: displayLabel,
    updated: relativeLabel,
  });

  return (
    <div
      className="flex items-center gap-2"
      role="status"
      aria-live="polite"
      aria-label={ariaLabel}
    >
      {/* Animated dot */}
      <span className="relative flex h-2 w-2" aria-hidden="true">
        {pulse && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full ${dotColor} opacity-75`}
          />
        )}
        <span
          className={`relative inline-flex h-2 w-2 rounded-full ${dotColor}`}
        />
      </span>
      <span className="text-sm text-stellar-text-secondary">{displayLabel}</span>
      <span
        className="text-xs text-stellar-text-secondary/80 underline-offset-2 hover:underline focus:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-stellar-blue rounded-sm"
        title={exactTitle}
        tabIndex={0}
        aria-label={exactTitle}
      >
        {relativeLabel}
      </span>
    </div>
  );
}
