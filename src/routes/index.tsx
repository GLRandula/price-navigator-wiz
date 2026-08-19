import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import heroImage from "@/assets/hero-colombo.jpg";
import { PredictWizard } from "@/components/PredictWizard";
import { Button } from "@/components/ui/button";

const TITLE = "LankaValue — Random Forest Property Price Prediction for Sri Lanka";
const DESCRIPTION =
  "Predict Sri Lankan house, land and apartment prices with a trained Random Forest model. Map-based location picking, 80% prediction intervals and feature-level explanations.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const NAV = [
  { id: "home", label: "Home" },
  { id: "features", label: "Features" },
  { id: "observations", label: "Observations" },
  { id: "predict", label: "Predict Price" },
];

const FEATURES = [
  {
    title: "Ensemble Random Forest core",
    body: "500 decision trees trained on verified listings across every province, tuned for skewed Sri Lankan price distributions.",
  },
  {
    title: "Map-anchored geospatial inputs",
    body: "Drop a pin anywhere on the island and latitude, longitude and derived proximity metrics resolve instantly.",
  },
  {
    title: "Calibrated 80% intervals",
    body: "Every valuation ships with P10 / P50 / P90 quantiles and a confidence grade instead of a single opaque figure.",
  },
  {
    title: "Feature-level explanations",
    body: "See exactly which attributes pushed the estimate up or down against the training median for that segment.",
  },
  {
    title: "Proximity intelligence",
    body: "Distance to schools, hospitals, main roads, city centres, tourist zones and flood-risk areas feed the model.",
  },
  {
    title: "Segment benchmarking",
    body: "Compare your property against min, quartile, median and max prices for identical layouts in the same city.",
  },
];

const DISTRICT_MEDIANS = [
  { district: "Colombo", median: 78 },
  { district: "Gampaha", median: 42 },
  { district: "Kalutara", median: 31 },
  { district: "Galle", median: 36 },
  { district: "Kandy", median: 34 },
  { district: "Matara", median: 24 },
  { district: "Kurunegala", median: 19 },
  { district: "Jaffna", median: 16 },
];

const ACCURACY_TREND = [
  { year: "2019", r2: 0.71 },
  { year: "2020", r2: 0.74 },
  { year: "2021", r2: 0.79 },
  { year: "2022", r2: 0.83 },
  { year: "2023", r2: 0.86 },
  { year: "2024", r2: 0.89 },
  { year: "2025", r2: 0.91 },
];

const OBSERVATIONS = [
  {
    stat: "1.85×",
    label: "Colombo premium",
    body: "Colombo district properties clear 1.85× the national median for identical layouts and land extents.",
  },
  {
    stat: "−34%",
    label: "Flood-zone drag",
    body: "Properties within one kilometre of mapped flood zones lose about a third of their expected value.",
  },
  {
    stat: "0.91",
    label: "Validation R²",
    body: "Hold-out performance on 2025 transactions, with a mean absolute percentage error near 12%.",
  },
  {
    stat: "58%",
    label: "Land weight",
    body: "Land extent contributes more to price than built area outside the Western Province.",
  },
];

function Index() {
  const [active, setActive] = useState("home");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    NAV.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen scroll-smooth bg-background">
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-4">
          <a href="#home" className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-md bg-accent font-display text-sm font-bold text-accent-foreground">
              LV
            </span>
            <span className="font-display text-base font-semibold">LankaValue</span>
          </a>
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  active === item.id
                    ? "bg-surface text-accent"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <Button asChild size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
            <a href="#predict">Predict Price</a>
          </Button>
        </div>
      </header>

      <section id="home" className="relative overflow-hidden">
        <img
          src={heroImage}
          alt="Aerial view of Colombo residential neighbourhoods at sunset"
          width={1600}
          height={1008}
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-ink/72" />
        <div className="relative mx-auto max-w-6xl px-5 py-24 md:py-32">
          <p className="section-label text-gold">Random Forest Valuation Engine</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold text-primary-foreground md:text-6xl">
            Know what Sri Lankan property is really worth.
          </h1>
          <p className="mt-5 max-w-2xl text-base text-primary-foreground/80 md:text-lg">
            A trained ensemble model turns district, dimensions and exact coordinates into a
            transparent valuation — complete with prediction intervals and the features driving
            them.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
              <a href="#predict">Start a valuation</a>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary-foreground/35 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">
              <a href="#observations">See observations</a>
            </Button>
          </div>
          <dl className="mt-14 grid max-w-2xl grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              ["24k+", "Training records"],
              ["25", "Districts covered"],
              ["0.91", "Validation R²"],
              ["80%", "Interval coverage"],
            ].map(([value, label]) => (
              <div key={label}>
                <dt className="font-display text-2xl font-bold text-gold">{value}</dt>
                <dd className="text-xs text-primary-foreground/70">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-5 py-20 md:py-24">
        <p className="section-label">Features</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-bold md:text-4xl">
          Built for interpretable valuations, not black-box numbers.
        </h2>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => (
            <article key={feature.title} className="surface-panel p-6">
              <span className="font-mono text-xs text-accent">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="observations" className="bg-surface/60 py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-5">
          <p className="section-label">Observations</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-bold md:text-4xl">
            What the training data tells us about the market.
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {OBSERVATIONS.map((item) => (
              <div key={item.label} className="surface-panel p-6">
                <p className="font-display text-3xl font-bold text-accent">{item.stat}</p>
                <p className="mt-1 text-sm font-semibold">{item.label}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <div className="surface-panel p-6">
              <h3 className="text-base font-semibold">Median price by district (LKR millions)</h3>
              <div className="mt-5 h-64">
                <ResponsiveContainer>
                  <BarChart data={DISTRICT_MEDIANS}>
                    <CartesianGrid vertical={false} stroke="var(--color-border)" />
                    <XAxis dataKey="district" tick={{ fontSize: 11 }} interval={0} angle={-25} dy={10} height={50} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: number) => `LKR ${v}M`} />
                    <Bar dataKey="median" fill="var(--color-accent)" radius={4} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="surface-panel p-6">
              <h3 className="text-base font-semibold">Model validation R² over training vintages</h3>
              <div className="mt-5 h-64">
                <ResponsiveContainer>
                  <AreaChart data={ACCURACY_TREND}>
                    <CartesianGrid vertical={false} stroke="var(--color-border)" />
                    <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0.6, 1]} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="r2"
                      stroke="var(--color-success)"
                      fill="var(--color-success)"
                      fillOpacity={0.18}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="predict" className="mx-auto max-w-5xl px-5 py-20 md:py-24">
        <p className="section-label">Predict Price</p>
        <h2 className="mt-3 text-3xl font-bold md:text-4xl">Run a valuation in three steps.</h2>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Regional parameters, dimension metrics, then geospatial anchors — results open in a
          detailed report with prediction and visual analysis tabs.
        </p>
        <div className="mt-10">
          <PredictWizard />
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-6xl px-5 text-xs text-muted-foreground">
          LankaValue — estimates are model outputs for guidance only and are not a formal
          valuation.
        </div>
      </footer>
    </div>
  );
}
