import React from "react";
import ErrorFallback from "./ErrorFallback";
import { logError } from "./errorReporting";
import type { ErrorInfo, RouteErrorBoundaryProps } from "./types";

const isDev = import.meta.env.DEV;

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  /** Incremented on retry so the route tree fully remounts. */
  retryKey: number;
}

/**
 * Route-level error boundary: isolates render failures to a single page,
 * offers remount-based retry, and surfaces a copyable error reference id.
 *
 * In development, errors are still reported loudly (console + stack in the
 * fallback) so they are not silently swallowed while keeping a recovery path.
 */
export default class RouteErrorBoundary extends React.Component<
  RouteErrorBoundaryProps,
  State
> {
  constructor(props: RouteErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, retryKey: 0 };
    this.resetError = this.resetError.bind(this);
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, reactErrorInfo: React.ErrorInfo) {
    const entry = logError(
      error,
      reactErrorInfo.componentStack ?? undefined,
      this.props.severity ?? "high",
      this.props.context ?? "Route"
    );
    this.setState({ errorInfo: entry });
    this.props.onError?.(error, reactErrorInfo);

    // Do not swallow in development: surface full diagnostics for the overlay/console.
    if (isDev) {
      console.error(
        `[RouteErrorBoundary] Render error (ref: ${entry.id})`,
        error,
        reactErrorInfo.componentStack
      );
    }
  }

  resetError() {
    this.setState((prev) => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryKey: prev.retryKey + 1,
    }));
    this.props.onReset?.();
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const { fallback, severity = "high" } = this.props;

      if (typeof fallback === "function") {
        return fallback({
          error: this.state.error,
          errorInfo: this.state.errorInfo ?? undefined,
          resetError: this.resetError,
          severity,
        });
      }

      if (fallback) {
        return fallback;
      }

      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo ?? undefined}
          resetError={this.resetError}
          severity={severity}
          title="This page crashed"
          message="Something went wrong while loading this page. You can try again without leaving the rest of the app."
        />
      );
    }

    // Key forces a full remount of the route tree on "Try again".
    return (
      <React.Fragment key={this.state.retryKey}>{this.props.children}</React.Fragment>
    );
  }
}
