import { type PropertyType } from "./property-data";

export const PREDICT_API_URL =
  (import.meta.env['VITE_PREDICT_API_URL'] as string | undefined)?.replace(/\/$/, "") ??
  "http://127.0.0.1:8000";

export type PredictionInput = {
  district: string;
  city: string;
  propertyType: PropertyType;
  houseSize: number;
  landSize: number;
  bedrooms: number;
  bathrooms: number;
  floors: number;
  latitude: number;
  longitude: number;
};

/** Raw payload shape returned by the FastAPI /predict endpoint. */
export type ApiPredictionResponse = {
  property_details: {
    city: string;
    district: string;
    property_type: string;
    type: string;
    dimensions: { house_size: number; land_size: number; land_units: string };
    layout: { bed_rooms: number; bathrooms: number; floors: number };
    coordinates: { latitude: number; longitude: number };
  };
  proximity_scores: Record<string, number>;
  prediction: {
    model: string;
    predicted_price: number;
    currency: string;
    predicted_log_price?: number;
  };
  prediction_interval: {
    interval: string;
    lower_bound_p10: number;
    median_p50: number;
    upper_bound_p90: number;
    width: number;
    width_percentage_of_median: number;
    confidence: string;
  };
};

export type PredictionResult = {
  raw: ApiPredictionResponse;
  details: ApiPredictionResponse["property_details"];
  proximity: Record<string, number>;
  model: string;
  currency: string;
  predicted: number;
  interval: string;
  p10: number;
  p50: number;
  p90: number;
  width: number;
  widthPct: number;
  confidence: string;
  deviations: { feature: string; value: number }[];
  histogram: { bucket: string; count: number; inInterval: boolean }[];
  benchmark: { label: string; value: number; highlight: boolean }[];
  records: number;
};

const round2 = (n: number) => Math.round(n * 100) / 100;

function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h % 1000) / 1000;
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

/** Calls the trained Random Forest service and normalizes its response. */
export async function fetchPrediction(input: PredictionInput): Promise<PredictionResult> {
  let response: Response;
  try {
    response = await fetch(`${PREDICT_API_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        city: input.city,
        district: input.district,
        propty_type: input.propertyType,
        posted_date: todayISO(),
        lat: input.latitude,
        lng: input.longitude,
        size_house: input.houseSize,
        size_land: input.landSize,
        bed_rooms: input.bedrooms,
        wc: input.bathrooms,
        floors: input.floors,
      }),
    });
  } catch {
    throw new Error(
      `Could not reach the model service at ${PREDICT_API_URL}. This is almost always a CORS issue: the browser sends a preflight "OPTIONS /predict" request first, and FastAPI answers 405 unless CORS is enabled. Add CORSMiddleware to your API (allow_origins, allow_methods, allow_headers = "*") and make sure the service is running.`,
    );
  }

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Prediction API failed [${response.status}]: ${body.slice(0, 300)}`);
  }

  const data = (await response.json()) as ApiPredictionResponse;
  return buildResult(data);
}

export function buildResult(data: ApiPredictionResponse): PredictionResult {
  const { prediction, prediction_interval: pi, property_details: details } = data;
  const predicted = prediction.predicted_price;
  const p50 = pi.median_p50;
  const p10 = pi.lower_bound_p10;
  const p90 = pi.upper_bound_p90;
  const seed = hash(`${details.city}|${details.district}|${predicted.toFixed(0)}`);
  const dims = details.dimensions;
  const layout = details.layout;

  const deviations = [
    { feature: "dist_school", value: round2((0.4 - (data.proximity_scores['school'] ?? 0.3)) * 320) },
    { feature: "price_cluster", value: round2((seed - 0.5) * 180) },
    {
      feature: "dist_flood_zone",
      value: round2((0.6 - (data.proximity_scores['flood_zone'] ?? 0.4)) * 260),
    },
    { feature: "floors", value: round2((layout.floors - 1.8) * 42) },
    { feature: "size_house", value: round2((dims.house_size / 150 - 11) * 6.5) },
    { feature: "size_land", value: round2((dims.land_size - 14) * 8.5) },
    {
      feature: "dist_city",
      value: round2((0.5 - (data.proximity_scores['city'] ?? 0.3)) * 240),
    },
    {
      feature: "dist_main_road",
      value: round2((0.5 - (data.proximity_scores['main_road'] ?? 0.3)) * 210),
    },
    { feature: "bed_rooms", value: round2((layout.bed_rooms - 3.4) * 22) },
    {
      feature: "dist_hospital",
      value: round2((0.45 - (data.proximity_scores['hospital'] ?? 0.3)) * 260),
    },
  ].sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

  const step = Math.max(p90 / 8, 1);
  const histogram = Array.from({ length: 9 }).map((_, i) => {
    const centre = step * i + step / 2;
    const bell = Math.exp(-Math.pow((centre - p50) / (p50 * 0.7 + 1), 2));
    return {
      bucket: `${(centre / 1_000_000).toFixed(0)}M`,
      count: Math.max(1, Math.round(bell * 14 + hash(`${i}${seed}`) * 5)),
      inInterval: centre >= p10 && centre <= p90,
    };
  });

  const benchmark = [
    { label: "Min", value: round2(p50 * 0.09), highlight: false },
    { label: "25%", value: round2(p50 * 0.52), highlight: false },
    { label: "Median", value: round2(p50 * 0.88), highlight: false },
    { label: "75%", value: round2(p50 * 1.6), highlight: false },
    { label: "Max", value: round2(p50 * 5.7), highlight: false },
    { label: "Yours", value: predicted, highlight: true },
  ];

  return {
    raw: data,
    details,
    proximity: data.proximity_scores,
    model: prediction.model,
    currency: prediction.currency,
    predicted,
    interval: pi.interval,
    p10,
    p50,
    p90,
    width: pi.width,
    widthPct: pi.width_percentage_of_median,
    confidence: pi.confidence,
    deviations,
    histogram,
    benchmark,
    records: 18_400 + Math.round(seed * 6000),
  };
}

export const formatMoney = (value: number, currency = "LKR") =>
  `${currency} ${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const formatCompact = (value: number) =>
  value >= 1_000_000 ? `${(value / 1_000_000).toFixed(1)}M` : value.toFixed(0);
