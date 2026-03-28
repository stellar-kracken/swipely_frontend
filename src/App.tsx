import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const AssetDetail = lazy(() => import("./pages/AssetDetail"));
const Bridges = lazy(() => import("./pages/Bridges"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Reports = lazy(() => import("./pages/Reports"));
const Landing = lazy(() => import("./pages/Landing"));

function App() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-stellar-dark flex items-center justify-center text-stellar-text-secondary">
          Loading page…
        </div>
      }
    >
      <Routes>
        {/* Landing page — full-page layout with its own nav */}
        <Route path="/" element={<Landing />} />

        {/* App pages — shared Layout with Navbar */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/assets/:symbol" element={<AssetDetail />} />
          <Route path="/bridges" element={<Bridges />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/reports" element={<Reports />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
