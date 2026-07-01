import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAssetsWithHealth } from "../hooks/useAssets";
import { useBridges } from "../hooks/useBridges";
import SwipelyMark from "../components/SwipelyMark";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StatItem {
  label: string;
  value: string | number;
  suffix?: string;
}

// ---------------------------------------------------------------------------
// Scroll-based reveal animation
// ---------------------------------------------------------------------------

function useIntersection(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

function AnimatedSection({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, visible } = useIntersection();

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={[
        "transition-all duration-700 ease-out",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function FeatureCard({
  icon,
  title,
  description,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <AnimatedSection delay={delay} className="h-full">
      <div className="group h-full rounded-2xl border border-stellar-border bg-stellar-card p-6 hover:border-stellar-blue/50 transition-colors duration-300">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-stellar-blue/10 text-stellar-blue group-hover:bg-stellar-blue group-hover:text-white transition-colors duration-300">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-stellar-text-primary">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-stellar-text-secondary">
          {description}
        </p>
      </div>
    </AnimatedSection>
  );
}

function StatCard({ label, value, suffix = "" }: StatItem) {
  return (
    <div className="rounded-2xl border border-stellar-border bg-stellar-card p-6 text-center">
      <p className="text-3xl font-bold text-stellar-text-primary">
        {value}
        <span className="text-stellar-blue">{suffix}</span>
      </p>
      <p className="mt-1 text-sm text-stellar-text-secondary">{label}</p>
    </div>
  );
}

function StepCard({
  step,
  title,
  description,
  delay,
}: {
  step: number;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <AnimatedSection delay={delay}>
      <div className="flex gap-5">
        <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-stellar-blue text-white font-bold text-sm">
          {step}
        </div>
        <div>
          <h3 className="font-semibold text-stellar-text-primary">{title}</h3>
          <p className="mt-1 text-sm text-stellar-text-secondary leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </AnimatedSection>
  );
}

// ---------------------------------------------------------------------------
// Icons (inline SVG, no external icon-library dependency)
// ---------------------------------------------------------------------------

const Icon = {
  Activity: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  Shield: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Bell: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  BarChart: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  GitBranch: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="6" y1="3" x2="6" y2="15" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M18 9a9 9 0 0 1-9 9" />
    </svg>
  ),
  Layers: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  ),
  Globe: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  Code: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  ArrowRight: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  ),
  Sparkle: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z" />
    </svg>
  ),
};

// ---------------------------------------------------------------------------
// API preview snippet — illustrative only, not a live/linked endpoint
// ---------------------------------------------------------------------------

const API_SNIPPET = `// Swipely REST API — example
const res = await fetch("/api/v1/assets/USDC/health");
const { overallScore, factors, trend } = await res.json();
// overallScore: 94
// factors: { liquidityDepth: 96, priceStability: 91, ... }
// trend: "improving"`;

// ---------------------------------------------------------------------------
// Main Landing page
// ---------------------------------------------------------------------------

export default function Landing() {
  const { data: assetsData } = useAssetsWithHealth();
  const { data: bridgesData } = useBridges();

  const totalAssets = assetsData?.length ?? 0;
  const totalBridges = bridgesData?.bridges?.length ?? 0;
  const avgScore = useMemo<string>(() => {
    if (!assetsData || assetsData.length === 0) return "—";
    const withScores = assetsData
      .map((a) => a.health?.overallScore)
      .filter((s): s is number => typeof s === "number");
    if (withScores.length === 0) return "—";
    return (withScores.reduce((a, b) => a + b, 0) / withScores.length).toFixed(0);
  }, [assetsData]);

  const stats: StatItem[] = [
    { label: "Assets Monitored", value: totalAssets || "—" },
    { label: "Bridges Tracked", value: totalBridges || "—" },
    { label: "Avg Health Score", value: avgScore, suffix: avgScore !== "—" ? "/100" : "" },
    { label: "Network", value: "Stellar" },
  ];

  const features = [
    {
      icon: <Icon.Activity />,
      title: "Real-Time Health Scores",
      description:
        "A composite 0–100 health score per asset, streamed live over WebSocket. Liquidity depth, price stability, and bridge uptime, in one number.",
    },
    {
      icon: <Icon.Shield />,
      title: "Supply & Reconciliation Checks",
      description:
        "Automatically reconcile Stellar-issued supply against source-chain collateral and flag mismatches down to fine-grained resolution.",
    },
    {
      icon: <Icon.Bell />,
      title: "Configurable Alerts & Playbooks",
      description:
        "Route low / medium / high severity alerts to the right team, attach response playbooks, and rehearse them in the alert simulation sandbox.",
    },
    {
      icon: <Icon.BarChart />,
      title: "Multi-DEX Liquidity Analytics",
      description:
        "Aggregate liquidity across Stellar DEX venues at multiple price-impact tiers, and surface fragmentation across pairs and pools.",
    },
    {
      icon: <Icon.GitBranch />,
      title: "Bridge & Asset Topology",
      description:
        "Explore how assets, bridges, and chains relate with an interactive topology graph, supply-chain view, and side-by-side comparisons.",
    },
    {
      icon: <Icon.Layers />,
      title: "Data Provenance & Drift Detection",
      description:
        "Trace any metric back to its source, and get notified when upstream schemas drift or data freshness falls outside expected bounds.",
    },
    {
      icon: <Icon.Code />,
      title: "REST & WebSocket API",
      description:
        "Every data point is available through a versioned REST API and a real-time WebSocket feed, so you can embed Swipely into your own tooling.",
    },
    {
      icon: <Icon.Globe />,
      title: "Built for Global Teams",
      description:
        "The dashboard ships with support for eight languages out of the box, so distributed operations teams can work in their own language.",
    },
  ];

  const steps = [
    {
      title: "Point it at Stellar",
      description:
        "Swipely indexes Stellar mainnet and testnet events in real time — no wallet connection required to view monitoring data.",
    },
    {
      title: "Watch your assets",
      description:
        "Registered assets and bridges appear on the dashboard with live health scores. Set deviation thresholds tailored to each one.",
    },
    {
      title: "Act on what you see",
      description:
        "Use the dashboard, the REST API, or the WebSocket feed to plug Swipely's data into your own trading, compliance, or ops workflows.",
    },
    {
      title: "Report and export",
      description:
        "Generate print-ready reports and scheduled exports covering network overviews, per-asset breakdowns, and bridge status.",
    },
  ];

  return (
    <div className="min-h-screen bg-stellar-dark">
      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 border-b border-stellar-border bg-stellar-dark/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              to="/"
              className="flex items-center gap-2 text-xl font-bold text-stellar-text-primary focus:outline-none focus:ring-2 focus:ring-stellar-blue rounded-sm"
            >
              <SwipelyMark />
              Swipely
            </Link>
            <div className="flex items-center gap-3">
              <Link
                to="/dashboard"
                className="hidden sm:block text-sm text-stellar-text-secondary hover:text-stellar-text-primary transition-colors"
              >
                Dashboard
              </Link>
              <Link
                to="/help"
                className="hidden sm:block text-sm text-stellar-text-secondary hover:text-stellar-text-primary transition-colors"
              >
                Docs
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-lg bg-stellar-blue px-4 py-2 text-sm font-medium text-white hover:bg-stellar-blue/80 transition-colors focus:outline-none focus:ring-2 focus:ring-stellar-blue"
              >
                Launch App
                <Icon.ArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-24 pb-32 sm:pt-32 sm:pb-40">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-stellar-blue/10 blur-3xl" />
          <div className="absolute right-0 bottom-0 h-[380px] w-[380px] translate-x-1/3 translate-y-1/3 rounded-full bg-[#00D4AA]/10 blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-stellar-blue/30 bg-stellar-blue/10 px-3 py-1 text-xs font-medium text-stellar-blue mb-6">
            <Icon.Sparkle />
            Monitoring, built for Stellar
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-stellar-text-primary leading-tight tracking-tight">
            Know the health of every
            <br />
            <span className="text-stellar-blue">bridge and asset</span>, instantly
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-stellar-text-secondary max-w-2xl mx-auto leading-relaxed">
            Swipely is a monitoring platform for cross-chain asset bridges and DEX
            liquidity on the Stellar network — real-time health scores, reconciliation,
            and alerting in a single dashboard.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-stellar-blue px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-stellar-blue/25 hover:bg-stellar-blue/90 transition-colors focus:outline-none focus:ring-2 focus:ring-stellar-blue focus:ring-offset-2 focus:ring-offset-stellar-dark"
            >
              Open Dashboard
              <Icon.ArrowRight />
            </Link>
            <a
              href="#product-preview"
              className="inline-flex items-center gap-2 rounded-xl border border-stellar-border px-7 py-3.5 text-base font-semibold text-stellar-text-primary hover:border-stellar-blue/50 transition-colors focus:outline-none focus:ring-2 focus:ring-stellar-blue"
            >
              See how it works
            </a>
          </div>
        </div>
      </section>

      {/* ── Live Stats ── */}
      <section className="bg-stellar-card border-y border-stellar-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <p className="text-center text-sm font-semibold uppercase tracking-widest text-stellar-text-secondary mb-8">
              Live network statistics
            </p>
          </AnimatedSection>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <AnimatedSection key={stat.label} delay={i * 80}>
                <StatCard {...stat} />
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-stellar-text-primary">
              Everything you need to monitor bridges
            </h2>
            <p className="mt-4 text-stellar-text-secondary max-w-2xl mx-auto">
              From raw on-chain data to actionable health scores, Swipely covers the
              full observability stack for bridged assets on Stellar.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feature, i) => (
              <FeatureCard key={feature.title} {...feature} delay={i * 60} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Product preview ── */}
      <section id="product-preview" className="py-24 bg-stellar-card border-y border-stellar-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-stellar-text-primary">
              One dashboard, full visibility
            </h2>
            <p className="mt-4 text-stellar-text-secondary max-w-xl mx-auto">
              Health scores, liquidity, and incidents side by side — no more
              switching between block explorers and spreadsheets.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={100}>
            <div className="mx-auto max-w-4xl rounded-2xl border border-stellar-border bg-stellar-dark overflow-hidden shadow-2xl">
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-stellar-border bg-stellar-card">
                {["#FF5F57", "#FFBD2E", "#27C93F"].map((color) => (
                  <div key={color} className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                ))}
                <span className="ml-2 text-xs text-stellar-text-secondary font-mono">
                  swipely — dashboard
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
                <div className="md:col-span-2 rounded-xl border border-stellar-border bg-stellar-card p-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-stellar-text-secondary mb-4">
                    Bridge health, 24h
                  </p>
                  <div className="flex items-end gap-2 h-32">
                    {[62, 74, 58, 81, 90, 76, 95, 88, 92, 84, 97, 91].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t-sm bg-gradient-to-t from-stellar-blue/40 to-stellar-blue"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-stellar-border bg-stellar-card p-4 flex flex-col justify-between">
                  <p className="text-xs font-semibold uppercase tracking-widest text-stellar-text-secondary mb-2">
                    Composite score
                  </p>
                  <p className="text-4xl font-bold text-stellar-text-primary">
                    94<span className="text-[#00D4AA] text-xl">/100</span>
                  </p>
                  <p className="mt-2 text-xs text-[#00D4AA] font-medium">▲ improving</p>
                </div>
                {[
                  { label: "USDC · Allbridge", score: 97, status: "Healthy" },
                  { label: "EURC · Allbridge", score: 91, status: "Healthy" },
                  { label: "wBTC · Wormhole", score: 68, status: "Watch" },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="md:col-span-3 flex items-center justify-between rounded-xl border border-stellar-border bg-stellar-card px-4 py-3 text-sm"
                  >
                    <span className="text-stellar-text-primary font-medium">{row.label}</span>
                    <span className="text-stellar-text-secondary">{row.status}</span>
                    <span className="font-mono text-stellar-blue">{row.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-stellar-text-primary">How it works</h2>
            <p className="mt-4 text-stellar-text-secondary max-w-xl">
              Get from zero to full bridge visibility in four steps.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl">
            {steps.map((step, i) => (
              <StepCard key={step.title} step={i + 1} {...step} delay={i * 100} />
            ))}
          </div>
        </div>
      </section>

      {/* ── API Preview ── */}
      <section className="py-24 bg-stellar-card border-y border-stellar-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <AnimatedSection>
              <span className="inline-block rounded-full bg-stellar-blue/10 px-3 py-1 text-xs font-semibold text-stellar-blue uppercase tracking-widest mb-4">
                Developer API
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-stellar-text-primary">
                Integrate in minutes
              </h2>
              <p className="mt-4 text-stellar-text-secondary leading-relaxed">
                A versioned REST API and a real-time WebSocket feed let you embed
                Swipely's data into your own applications, bots, and dashboards.
              </p>
              <ul className="mt-6 space-y-2 text-sm text-stellar-text-secondary">
                {[
                  "REST endpoints for assets, bridges, prices, and health scores",
                  "WebSocket channel for live health score updates",
                  "Pagination, filtering, and date-range queries",
                  "API keys managed directly from the dashboard",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-0.5 flex-shrink-0 text-stellar-blue">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link
                  to="/api-docs"
                  className="inline-flex items-center gap-2 rounded-xl bg-stellar-blue px-6 py-3 text-sm font-semibold text-white hover:bg-stellar-blue/90 transition-colors focus:outline-none focus:ring-2 focus:ring-stellar-blue"
                >
                  Read the API docs
                  <Icon.ArrowRight />
                </Link>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={150}>
              <div className="rounded-2xl border border-stellar-border bg-stellar-dark overflow-hidden">
                <div className="flex items-center gap-1.5 px-4 py-3 border-b border-stellar-border bg-stellar-card">
                  {["#FF5F57", "#FFBD2E", "#27C93F"].map((color) => (
                    <div key={color} className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                  ))}
                  <span className="ml-2 text-xs text-stellar-text-secondary font-mono">
                    example.ts
                  </span>
                </div>
                <pre className="overflow-x-auto p-5 text-xs leading-relaxed text-green-300 font-mono">
                  <code>{API_SNIPPET}</code>
                </pre>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ── Call to Action ── */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <h2 className="text-3xl sm:text-4xl font-bold text-stellar-text-primary">
              Start monitoring your bridges today
            </h2>
            <p className="mt-4 text-stellar-text-secondary max-w-xl mx-auto">
              No wallet connection required to explore the public dashboard.
            </p>
            <div className="mt-10 flex items-center justify-center">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-stellar-blue px-8 py-4 text-base font-semibold text-white shadow-lg shadow-stellar-blue/25 hover:bg-stellar-blue/90 transition-colors focus:outline-none focus:ring-2 focus:ring-stellar-blue focus:ring-offset-2 focus:ring-offset-stellar-dark"
              >
                Open the Dashboard
                <Icon.ArrowRight />
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-stellar-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-stellar-text-secondary">
          <p className="flex items-center gap-2">
            <SwipelyMark size={18} />
            <span>
              © {new Date().getFullYear()}{" "}
              <span className="text-stellar-text-primary font-medium">Swipely</span> — Built
              on Stellar
            </span>
          </p>
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="hover:text-stellar-text-primary transition-colors">
              Dashboard
            </Link>
            <Link to="/bridges" className="hover:text-stellar-text-primary transition-colors">
              Bridges
            </Link>
            <Link to="/analytics" className="hover:text-stellar-text-primary transition-colors">
              Analytics
            </Link>
            <Link to="/help" className="hover:text-stellar-text-primary transition-colors">
              Help
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
