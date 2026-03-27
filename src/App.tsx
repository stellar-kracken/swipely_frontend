import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const AssetDetail = lazy(() => import("./pages/AssetDetail"));
const Bridges = lazy(() => import("./pages/Bridges"));
const Analytics = lazy(() => import("./pages/Analytics"));

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
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/assets/:symbol" element={<AssetDetail />} />
          <Route path="/bridges" element={<Bridges />} />
          <Route path="/analytics" element={<Analytics />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
