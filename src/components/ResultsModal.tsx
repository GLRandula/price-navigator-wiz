import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCompact, formatMoney, type PredictionResult } from "@/lib/prediction";

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="mb-3 text-center text-xs font-semibold tracking-wide text-foreground">
        {title}
      </p>
      <div className="h-56">{children}</div>
    </div>
  );
}

const PROXIMITY_LABELS: Record<string, string> = {
  school: "School",
  hospital: "Hospital",
  city: "City",
  tourist_attraction: "Tourist",
  main_road: "Main road",
  flood_zone: "Flood zone",
};

export function ResultsModal({
  result,
  open,
  onOpenChange,
}: {
  result: PredictionResult | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!result) return null;
  const { details, currency } = result;
  const dims = details.dimensions;
  const layout = details.layout;
  const coords = details.coordinates;
  const span = Math.max(result.p90 - result.p10, 1);
  const medianPct = ((result.p50 - result.p10) / span) * 100;
  const pointPct = Math.min(100, Math.max(0, ((result.predicted - result.p10) / span) * 100));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-hidden p-0 sm:max-w-3xl">
        <div className="hero-gradient flex items-start justify-between gap-4 px-6 py-5">
          <div>
            <DialogTitle className="text-xl text-primary-foreground">
              Property Valuation Results
            </DialogTitle>
            <p className="mt-1 text-sm text-primary-foreground/75">
              {details.city}, {details.district} — {details.property_type} ({details.type})
            </p>
          </div>
          <div aria-hidden className="size-6" />
        </div>

        <Tabs defaultValue="prediction" className="max-h-[68vh] overflow-y-auto px-6 pb-6">
          <TabsList className="w-full">
            <TabsTrigger value="prediction" className="flex-1">
              Prediction Output
            </TabsTrigger>
            <TabsTrigger value="graphs" className="flex-1">
              Visual Analysis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="prediction" className="mt-5 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-border bg-surface/60 p-4">
                <p className="section-label mb-3">Property Details</p>
                <div className="space-y-2">
                  <DetailRow
                    label="Dimensions"
                    value={`${details.property_type} ${dims.house_size} sqft · Land ${dims.land_size} ${dims.land_units}`}
                  />
                  <DetailRow
                    label="Layout"
                    value={`${layout.bed_rooms} Bed · ${layout.bathrooms} Bath · ${layout.floors} Floor`}
                  />
                  <DetailRow
                    label="Coordinates"
                    value={`(${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)})`}
                  />
                </div>
              </div>
              <div className="rounded-lg border border-border bg-surface/60 p-4">
                <p className="section-label mb-3">Proximity Scores</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 font-mono text-xs">
                  {Object.entries(result.proximity).map(([key, value]) => (
                    <div key={key} className="flex justify-between gap-2">
                      <span className="text-muted-foreground">
                        {PROXIMITY_LABELS[key] ?? key}:
                      </span>
                      <span className="text-foreground">{value.toFixed(4)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-success/35 bg-success/8 p-6 text-center">
              <p className="section-label text-success">{result.model} Predicted Price</p>
              <p className="mt-2 font-display text-3xl font-bold text-success md:text-4xl">
                {formatMoney(result.predicted, currency)}
              </p>
            </div>

            <div className="rounded-xl border border-border">
              <div className="flex items-center justify-between border-b border-border bg-surface/60 px-4 py-3">
                <p className="text-sm font-semibold">{result.interval} Prediction Interval</p>
                <Badge variant="secondary" className="bg-gold/25 text-gold-foreground">
                  {result.confidence} CONFIDENCE
                </Badge>
              </div>
              <div className="divide-y divide-border">
                <div className="flex justify-between px-4 py-3 text-sm text-muted-foreground">
                  <span>Lower Bound (P10)</span>
                  <span>{formatMoney(result.p10, currency)}</span>
                </div>
                <div className="flex justify-between bg-surface/40 px-4 py-3 text-sm font-semibold text-primary">
                  <span>Median (P50)</span>
                  <span>{formatMoney(result.p50, currency)}</span>
                </div>
                <div className="flex justify-between px-4 py-3 text-sm text-muted-foreground">
                  <span>Upper Bound (P90)</span>
                  <span>{formatMoney(result.p90, currency)}</span>
                </div>
                <div className="flex justify-between px-4 py-3 text-xs text-muted-foreground">
                  <span>Width: {formatMoney(result.width, currency)}</span>
                  <span>{result.widthPct.toFixed(1)}% of median</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="graphs" className="mt-5 space-y-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="mb-6 text-center text-xs font-semibold text-foreground">
                Prediction Interval (P10 – P90)
              </p>
              <div className="relative mx-2 h-16 rounded-md bg-accent/12">
                <div
                  className="absolute top-0 bottom-0 w-px bg-success"
                  style={{ left: `${medianPct}%` }}
                />
                <div
                  className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-destructive"
                  style={{ left: `${pointPct}%` }}
                />
              </div>
              <div className="mt-2 flex justify-between px-1 font-mono text-[11px] text-muted-foreground">
                <span>{formatCompact(result.p10)}</span>
                <span className="text-success">Median {formatCompact(result.p50)}</span>
                <span>{formatCompact(result.p90)}</span>
              </div>
              <p className="mt-3 text-center text-[11px] text-muted-foreground">
                Diamond = {result.model} point estimate · Band = {result.interval} interval
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <ChartCard title="Top 10 Feature Deviations (%)">
                <ResponsiveContainer>
                  <BarChart data={result.deviations} layout="vertical" margin={{ left: 10 }}>
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="feature" width={92} tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} />
                    <Bar dataKey="value" radius={2}>
                      {result.deviations.map((entry) => (
                        <Cell
                          key={entry.feature}
                          fill={
                            entry.value >= 0 ? "var(--color-success)" : "var(--color-destructive)"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title={`Price Distribution in ${details.city}`}>
                <ResponsiveContainer>
                  <BarChart data={result.histogram}>
                    <XAxis dataKey="bucket" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="count" radius={2}>
                      {result.histogram.map((entry) => (
                        <Cell
                          key={entry.bucket}
                          fill={entry.inInterval ? "var(--color-accent)" : "var(--color-border)"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            <ChartCard
              title={`vs ${layout.bed_rooms}-BR ${details.property_type} (${result.records.toLocaleString()} records)`}
            >
              <ResponsiveContainer>
                <BarChart data={result.benchmark}>
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    tickFormatter={(v: number) => `${(v / 1_000_000).toFixed(0)}M`}
                  />
                  <Tooltip formatter={(v: number) => formatMoney(v, currency)} />
                  <Bar dataKey="value" radius={3}>
                    <LabelList
                      dataKey="value"
                      position="top"
                      fontSize={10}
                      formatter={(v: number) => `${(v / 1_000_000).toFixed(1)}M`}
                    />
                    {result.benchmark.map((entry) => (
                      <Cell
                        key={entry.label}
                        fill={entry.highlight ? "var(--color-destructive)" : "var(--color-primary)"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </TabsContent>
        </Tabs>

        <div className="border-t border-border px-6 py-4 text-center">
          <Button onClick={() => onOpenChange(false)} className="px-8">
            Close Results
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
