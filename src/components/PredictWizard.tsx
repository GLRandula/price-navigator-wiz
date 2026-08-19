import { useMemo, useState } from "react";

import { LocationPicker } from "@/components/LocationPicker";
import { ResultsModal } from "@/components/ResultsModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { predictPrice, type PredictionResult } from "@/lib/prediction";
import {
  DISTRICTS,
  PROPERTY_TYPES,
  TRANSACTION_TYPES,
  type PropertyType,
  type TransactionType,
} from "@/lib/property-data";

const STEPS = [
  { title: "Regional Parameters", hint: "Where the property sits administratively" },
  { title: "Dimension Metrics", hint: "Built area, land extent and layout" },
  { title: "Geospatial Anchors", hint: "Pin the exact location on the map" },
];

export function PredictWizard() {
  const [step, setStep] = useState(0);
  const [district, setDistrict] = useState("Colombo");
  const [city, setCity] = useState("Nugegoda");
  const [transaction, setTransaction] = useState<TransactionType>("sales");
  const [propertyType, setPropertyType] = useState<PropertyType>("House");
  const [houseSize, setHouseSize] = useState("12.5");
  const [landSize, setLandSize] = useState("15");
  const [bedrooms, setBedrooms] = useState(3);
  const [bathrooms, setBathrooms] = useState(2);
  const [stories, setStories] = useState(1);
  const [lat, setLat] = useState(6.8649);
  const [lng, setLng] = useState(79.8997);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [open, setOpen] = useState(false);

  const cities = useMemo(
    () => DISTRICTS.find((d) => d.name === district)?.cities ?? [],
    [district],
  );

  function handleDistrict(next: string) {
    setDistrict(next);
    const first = DISTRICTS.find((d) => d.name === next)?.cities[0];
    if (first) {
      setCity(first.name);
      setLat(first.lat);
      setLng(first.lng);
    }
  }

  function handleCity(next: string) {
    setCity(next);
    const match = cities.find((c) => c.name === next);
    if (match) {
      setLat(match.lat);
      setLng(match.lng);
    }
  }

  function run() {
    setResult(
      predictPrice({
        district,
        city,
        transaction,
        propertyType,
        houseSize: Number(houseSize) || 0,
        landSize: Number(landSize) || 0,
        bedrooms,
        bathrooms,
        stories,
        latitude: lat,
        longitude: lng,
      }),
    );
    setOpen(true);
  }

  return (
    <div className="surface-panel overflow-hidden">
      <div className="hero-gradient px-6 py-6">
        <h3 className="text-xl font-semibold text-primary-foreground md:text-2xl">
          Sri Lankan Real Estate Profile Modeler
        </h3>
        <p className="mt-1 text-sm text-primary-foreground/75">
          Tune structural values, localized features and spatial metrics to evaluate real-time
          model predictions.
        </p>
      </div>

      <div className="flex flex-col gap-4 border-b border-border bg-surface/50 px-6 py-5 sm:flex-row">
        {STEPS.map((item, index) => {
          const active = index === step;
          const done = index < step;
          return (
            <button
              key={item.title}
              type="button"
              onClick={() => setStep(index)}
              className={`flex flex-1 items-start gap-3 rounded-lg border px-3 py-3 text-left transition-colors ${
                active
                  ? "border-accent bg-card"
                  : "border-transparent hover:border-border hover:bg-card/60"
              }`}
            >
              <span
                className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  active || done
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {done ? "✓" : index + 1}
              </span>
              <span>
                <span className="block text-sm font-semibold text-foreground">{item.title}</span>
                <span className="block text-xs text-muted-foreground">{item.hint}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="px-6 py-7">
        {step === 0 && (
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Administrative District</Label>
              <Select value={district} onValueChange={handleDistrict}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DISTRICTS.map((d) => (
                    <SelectItem key={d.name} value={d.name}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Target City</Label>
              <Select value={city} onValueChange={handleCity}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((c) => (
                    <SelectItem key={c.name} value={c.name}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Transaction Intent</Label>
              <Select
                value={transaction}
                onValueChange={(v) => setTransaction(v as TransactionType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRANSACTION_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Property Taxonomy</Label>
              <Select
                value={propertyType}
                onValueChange={(v) => setPropertyType(v as PropertyType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-7 md:grid-cols-2">
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="house-size">House Area Size (perch)</Label>
                <Input
                  id="house-size"
                  type="number"
                  min="0"
                  step="0.5"
                  value={houseSize}
                  onChange={(e) => setHouseSize(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="land-size">Total Land Area (perch)</Label>
                <Input
                  id="land-size"
                  type="number"
                  min="0"
                  step="0.5"
                  value={landSize}
                  onChange={(e) => setLandSize(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-6">
              <SliderRow
                label="Bedrooms Count"
                value={bedrooms}
                min={1}
                max={10}
                onChange={setBedrooms}
              />
              <SliderRow
                label="Bathrooms (WC)"
                value={bathrooms}
                min={1}
                max={8}
                onChange={setBathrooms}
              />
              <SliderRow
                label="Total Structural Stories"
                value={stories}
                min={1}
                max={5}
                onChange={setStories}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <p className="text-sm text-muted-foreground">
              Click anywhere on the map to drop the pin — latitude and longitude update
              automatically.
            </p>
            <LocationPicker
              lat={lat}
              lng={lng}
              onPick={(nextLat, nextLng) => {
                setLat(nextLat);
                setLng(nextLng);
              }}
            />
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="lat">Geospatial Latitude</Label>
                <Input
                  id="lat"
                  type="number"
                  step="0.000001"
                  value={lat}
                  onChange={(e) => setLat(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lng">Geospatial Longitude</Label>
                <Input
                  id="lng"
                  type="number"
                  step="0.000001"
                  value={lng}
                  onChange={(e) => setLng(Number(e.target.value))}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border bg-surface/50 px-6 py-5">
        <Button
          variant="outline"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
        >
          Back
        </Button>
        <span className="text-xs text-muted-foreground">
          Step {step + 1} of {STEPS.length}
        </span>
        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}>
            Continue
          </Button>
        ) : (
          <Button onClick={run} className="bg-accent text-accent-foreground hover:bg-accent/90">
            Run Valuation Pipeline
          </Button>
        )}
      </div>

      <ResultsModal result={result} open={open} onOpenChange={setOpen} />
    </div>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <span className="font-mono text-sm text-accent">{value}</span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={1}
        onValueChange={([next]) => onChange(next)}
      />
    </div>
  );
}