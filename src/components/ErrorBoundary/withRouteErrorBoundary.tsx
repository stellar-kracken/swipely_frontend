import type { ComponentType, ReactNode } from "react";
import RouteErrorBoundary from "./RouteErrorBoundary";

/**
 * Wraps a page/route element in a RouteErrorBoundary so a single page crash
 * cannot blank the rest of the app shell.
 */
export function withRouteErrorBoundary(
  element: ReactNode,
  context: string
): ReactNode {
  return (
    <RouteErrorBoundary context={context} severity="high">
      {element}
    </RouteErrorBoundary>
  );
}

/**
 * HOC variant for non-lazy page components when needed in tests or stories.
 */
export function withRouteErrorBoundaryHoc<P extends object>(
  Page: ComponentType<P>,
  context: string
): ComponentType<P> {
  function Wrapped(props: P) {
    return (
      <RouteErrorBoundary context={context} severity="high">
        <Page {...props} />
      </RouteErrorBoundary>
    );
  }
  Wrapped.displayName = `withRouteErrorBoundary(${Page.displayName ?? Page.name ?? "Page"})`;
  return Wrapped;
}
