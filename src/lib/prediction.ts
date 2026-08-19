import { DISTRICTS, type PropertyType, type TransactionType } from "./property-data";

export type PredictionInput = {
  district: string;
  city: string;
  transaction: TransactionType;
  propertyType: PropertyType;
  houseSize: number;
  landSize: number;
  bedrooms: number;
  bathrooms: number;
  stories: number;
  latitude: number;
  longitude: number;
};

export type ProximityScores = {
  school: number;
  city: number;
  road: number;
  hospital: number;
  tourist: number;
  flood: number;
};

export type PredictionResult = {
  input: PredictionInput;
  predicted: number;
  p10: number;
  p50: number;
  p90: number;
  confidence: "HIGH CONFIDENCE" | "MODERATE CONFIDENCE" | "LOW CONFIDENCE";
  proximity: ProximityScores;
  deviations: { feature: string; value: number }[];
  histogram: { bucket: string; count: number; inInterval: boolean }[];
  benchmark: { label: string; value: number; highlight: boolean }[];
  records: number;
};

const DISTRICT_MULTIPLIER: Record<string, number> = {
  Colombo: 1.85,
  Gampaha: 1.25,
  Kalutara: 1.05,
  Kandy: 1.1,
  Galle: 1.2,
  Matara: 0.95,
  Kurunegala: 0.8,
  Jaffna: 0.75,
  Anuradhapura: 0.7,
  "Nuwara Eliya": 0.9,
};

const TYPE_MULTIPLIER: Record<PropertyType, number> = {
  House: 1,
  Apartment: 1.15,
  Land: 0.6,
  Villa: 1.55,
  Commercial: 1.4,
};

const money = (n: number) => Math.round(n * 100) / 100;

function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h % 1000) / 1000;
}

function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const dLat = (aLat - bLat) * 111;
  const dLng = (aLng - bLng) * 111 * Math.cos((aLat * Math.PI) / 180);
  return Math.sqrt(dLat * dLat + dLng * dLng);
}

/**
 * Client-side surrogate of the trained Random Forest regressor.
 * Swap this single function for a call to the production model endpoint.
 */
export function predictPrice(input: PredictionInput): PredictionResult {
  const seed = hash(`${input.district}|${input.city}|${input.propertyType}|${input.latitude}`);
  const district = DISTRICTS.find((d) => d.name === input.district);
  const centreDistance = district
    ? distanceKm(input.latitude, input.longitude, district.lat, district.lng)
    : 12;

  const base = 2_650_000;
  const areaValue = input.houseSize * base * 0.42 + input.landSize * base * 0.58;
  const layout = 1 + input.bedrooms * 0.045 + input.bathrooms * 0.03 + (input.stories - 1) * 0.05;
  const locality = DISTRICT_MULTIPLIER[input.district] ?? 0.85;
  const decay = 1 / (1 + centreDistance / 45);
  const rentFactor = input.transaction === "rent" ? 0.0055 : 1;

  const predicted = money(
    areaValue *
      layout *
      locality *
      decay *
      TYPE_MULTIPLIER[input.propertyType] *
      (0.92 + seed * 0.18) *
      rentFactor,
  );

  const spread = 0.24 + seed * 0.2;
  const p50 = money(predicted * (0.94 + seed * 0.08));
  const p10 = money(p50 * (1 - spread));
  const p90 = money(p50 * (1 + spread * 1.35));

  const width = (p90 - p10) / p50;
  const confidence =
    width < 0.55 ? "HIGH CONFIDENCE" : width < 0.95 ? "MODERATE CONFIDENCE" : "LOW CONFIDENCE";

  const proximity: ProximityScores = {
    school: money(320 + seed * 1200 + centreDistance * 240),
    city: money(90 + centreDistance * 310),
    road: money(140 + seed * 900 + centreDistance * 180),
    hospital: money(600 + seed * 2100 + centreDistance * 420),
    tourist: money(400 + seed * 3800),
    flood: money(seed < 0.2 ? 0 : seed * 60),
  };

  const deviations = [
    { feature: "dist_school", value: money((0.4 - seed) * 620) },
    { feature: "price_cluster", value: money((seed - 0.5) * 180) },
    { feature: "dist_flood_zone", value: money((0.6 - seed) * 210) },
    { feature: "floors", value: money((input.stories - 1.8) * 42) },
    { feature: "size_house", value: money((input.houseSize - 11) * 6.5) },
    { feature: "city", value: money((seed - 0.55) * 120) },
    { feature: "dist_city", value: money((8 - centreDistance) * 9) },
    { feature: "dist_main_road", value: money((0.5 - seed) * 150) },
    { feature: "bed_rooms", value: money((input.bedrooms - 3.4) * 22) },
    { feature: "dist_hospital", value: money((0.45 - seed) * 260) },
  ].sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

  const step = Math.max(p90 / 8, 1);
  const histogram = Array.from({ length: 9 }).map((_, i) => {
    const from = step * i;
    const to = step * (i + 1);
    const centre = (from + to) / 2;
    const bell = Math.exp(-Math.pow((centre - p50) / (p50 * 0.7 + 1), 2));
    return {
      bucket: `${(from / 1_000_000).toFixed(0)}M`,
      count: Math.max(1, Math.round(bell * 14 + hash(`${i}${seed}`) * 5)),
      inInterval: centre >= p10 && centre <= p90,
    };
  });

  const benchmark = [
    { label: "Min", value: money(p50 * 0.09), highlight: false },
    { label: "25%", value: money(p50 * 0.52), highlight: false },
    { label: "Median", value: money(p50 * 0.88), highlight: false },
    { label: "75%", value: money(p50 * 1.6), highlight: false },
    { label: "Max", value: money(p50 * 5.7), highlight: false },
    { label: "Yours", value: predicted, highlight: true },
  ];

  return {
    input,
    predicted,
    p10,
    p50,
    p90,
    confidence,
    proximity,
    deviations,
    histogram,
    benchmark,
    records: 18_400 + Math.round(seed * 6000),
  };
}

export const formatLKR = (value: number) =>
  `LKR ${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const formatCompact = (value: number) =>
  value >= 1_000_000 ? `${(value / 1_000_000).toFixed(1)}M` : value.toFixed(0);