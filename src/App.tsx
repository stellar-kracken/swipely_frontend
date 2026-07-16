import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import { LoadingFallback } from "./components/LoadingFallback";
import { GlobalErrorBoundary, withRouteErrorBoundary } from "./components/ErrorBoundary";
import { NotificationProvider } from "./context/NotificationContext";
import { useNotifications } from "./hooks/useNotifications";

/** Wrap a top-level page element in a route error boundary. */
const routePage = withRouteErrorBoundary;

const Dashboard = lazy(() => import("./pages/Dashboard"));
const AssetDetail = lazy(() => import("./pages/AssetDetail"));
const Bridges = lazy(() => import("./pages/Bridges"));
const Incidents = lazy(() => import("./pages/Incidents"));
const IncidentReplay = lazy(() => import("./pages/IncidentReplay"));
const Analytics = lazy(() => import("./pages/Analytics"));
const CustomMetricBuilder = lazy(() => import("./pages/CustomMetricBuilder"));
const Reports = lazy(() => import("./pages/Reports"));
const Landing = lazy(() => import("./pages/Landing"));
const Settings = lazy(() => import("./pages/Settings"));
const WatchlistPage = lazy(() => import("./pages/Watchlist"));
const WatchlistsPage = lazy(() => import("./pages/Watchlists"));
const Transactions = lazy(() => import("./pages/Transactions"));
const ApiKeys = lazy(() => import("./pages/ApiKeys"));
const AlertRoutingAdmin = lazy(() => import("./pages/AlertRoutingAdmin"));
const SupplyChain = lazy(() => import("./pages/SupplyChain"));
const BridgeTopologyExplorer = lazy(() => import("./pages/BridgeTopologyExplorer"));
const Reconciliation = lazy(() => import("./pages/Reconciliation"));
const ApiDocs = lazy(() => import("./pages/ApiDocs"));
const Help = lazy(() => import("./pages/Help"));
const ReleaseNotes = lazy(() => import("./pages/ReleaseNotes"));
const NotificationPreferencesPage = lazy(() => import("./pages/NotificationPreferencesPage"));
const RelationshipExplorer = lazy(() => import("./pages/RelationshipExplorer"));
const SearchResultsPage = lazy(() => import("./pages/SearchResultsPage"));
const Alerts = lazy(() => import("./pages/Alerts"));
const AlertPlaybookViewer = lazy(() => import("./pages/AlertPlaybookViewer"));
const DataProvenanceGraph = lazy(() => import("./pages/DataProvenanceGraph"));
const AlertSimulationSandbox = lazy(() => import("./pages/AlertSimulationSandbox"));
const LiquidityFragmentation = lazy(() => import("./pages/LiquidityFragmentation"));
const LiquidityDashboard = lazy(() => import("./pages/LiquidityDashboard"));
const SchemaDriftMonitor = lazy(() => import("./pages/SchemaDriftMonitor"));
const OperationalAccessAudit = lazy(() => import("./pages/OperationalAccessAudit"));
const BridgeHealthTimeline = lazy(() => import("./pages/BridgeHealthTimeline"));
const ExportScheduler = lazy(() => import("./pages/ExportScheduler"));
const AssetComparison = lazy(() => import("./pages/AssetComparison"));
const MetricsSidebarPage = lazy(() => import("./pages/MetricsSidebar"));
const CrossChainVerification = lazy(() => import("./pages/CrossChainVerification"));
const FreshnessMonitoring = lazy(() => import("./pages/FreshnessMonitoring"));

function NotificationInitializer() {
  useNotifications();
  return null;
}

function App() {
  return (
    <GlobalErrorBoundary>
      <NotificationProvider>
        <NotificationInitializer />
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={routePage(<Landing />, "Route:/")} />

            <Route element={<Layout />}>
              {/*
                Each top-level page is wrapped so a render error stays on that route.
                Layout also keeps a pathname-keyed boundary around <Outlet /> as a
                safety net (and so the shell survives when Suspense resolves late).
              */}
              <Route path="/dashboard" element={routePage(<Dashboard />, "Route:/dashboard")} />
              <Route path="/assets/:symbol" element={routePage(<AssetDetail />, "Route:/assets/:symbol")} />
              <Route path="/bridges" element={routePage(<Bridges />, "Route:/bridges")} />
              <Route path="/incidents" element={routePage(<Incidents />, "Route:/incidents")} />
              <Route path="/incidents/replay/:id" element={routePage(<IncidentReplay />, "Route:/incidents/replay/:id")} />
              <Route path="/alerts" element={routePage(<Alerts />, "Route:/alerts")} />
              <Route path="/alert-playbooks" element={routePage(<AlertPlaybookViewer />, "Route:/alert-playbooks")} />
              <Route path="/transactions" element={routePage(<Transactions />, "Route:/transactions")} />
              <Route path="/analytics" element={routePage(<Analytics />, "Route:/analytics")} />
              <Route path="/analytics/metric-builder" element={routePage(<CustomMetricBuilder />, "Route:/analytics/metric-builder")} />
              <Route path="/reports" element={routePage(<Reports />, "Route:/reports")} />
              <Route path="/watchlist" element={routePage(<WatchlistPage />, "Route:/watchlist")} />
              <Route path="/watchlists" element={routePage(<WatchlistsPage />, "Route:/watchlists")} />
              <Route path="/settings" element={routePage(<Settings />, "Route:/settings")} />
              <Route path="/admin/api-keys" element={routePage(<ApiKeys />, "Route:/admin/api-keys")} />
              <Route path="/admin/alert-routing" element={routePage(<AlertRoutingAdmin />, "Route:/admin/alert-routing")} />
              <Route path="/admin/access-audit" element={routePage(<OperationalAccessAudit />, "Route:/admin/access-audit")} />
              <Route path="/supply-chain" element={routePage(<SupplyChain />, "Route:/supply-chain")} />
              <Route path="/bridge-topology" element={routePage(<BridgeTopologyExplorer />, "Route:/bridge-topology")} />
              <Route path="/reconciliation" element={routePage(<Reconciliation />, "Route:/reconciliation")} />
              <Route path="/api-docs" element={routePage(<ApiDocs />, "Route:/api-docs")} />
              <Route path="/help" element={routePage(<Help />, "Route:/help")} />
              <Route path="/release-notes" element={routePage(<ReleaseNotes />, "Route:/release-notes")} />
              <Route path="/notification-preferences" element={routePage(<NotificationPreferencesPage />, "Route:/notification-preferences")} />
              <Route path="/relationship-explorer" element={routePage(<RelationshipExplorer />, "Route:/relationship-explorer")} />
              <Route path="/search" element={routePage(<SearchResultsPage />, "Route:/search")} />
              <Route path="/data-provenance" element={routePage(<DataProvenanceGraph />, "Route:/data-provenance")} />
              <Route path="/alert-sandbox" element={routePage(<AlertSimulationSandbox />, "Route:/alert-sandbox")} />
              <Route path="/liquidity-fragmentation" element={routePage(<LiquidityFragmentation />, "Route:/liquidity-fragmentation")} />
              <Route path="/liquidity-dashboard" element={routePage(<LiquidityDashboard />, "Route:/liquidity-dashboard")} />
              <Route path="/schema-drift" element={routePage(<SchemaDriftMonitor />, "Route:/schema-drift")} />
              <Route path="/bridge-health-timeline" element={routePage(<BridgeHealthTimeline />, "Route:/bridge-health-timeline")} />
              <Route path="/export-scheduler" element={routePage(<ExportScheduler />, "Route:/export-scheduler")} />
              <Route path="/asset-comparison" element={routePage(<AssetComparison />, "Route:/asset-comparison")} />
              <Route path="/metrics-sidebar" element={routePage(<MetricsSidebarPage />, "Route:/metrics-sidebar")} />
              <Route path="/cross-chain-verification" element={routePage(<CrossChainVerification />, "Route:/cross-chain-verification")} />
              <Route path="/freshness" element={routePage(<FreshnessMonitoring />, "Route:/freshness")} />
            </Route>
          </Routes>
        </Suspense>
      </NotificationProvider>
    </GlobalErrorBoundary>
  );
}

export default App;
