/**
 * Resolves the backend origin from VITE_API_BASE_URL (e.g. on Vercel, where
 * there's no dev-server/nginx proxy in front of the static build). When
 * unset, REST/WS calls fall back to same-origin relative paths, which is
 * what the Vite dev proxy and the Docker/Nginx production image expect.
 */
const configuredOrigin = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "");

export const API_BASE_URL = configuredOrigin ? `${configuredOrigin}/api/v1` : "/api/v1";

/** Absolute ws(s):// URL when a backend origin is configured, otherwise null. */
export function resolveWsUrl(path: string): string | null {
  if (!configuredOrigin) return null;
  return `${configuredOrigin.replace(/^http/, "ws")}${path}`;
}
