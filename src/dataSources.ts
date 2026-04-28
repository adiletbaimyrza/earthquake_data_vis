import type { EarthquakeRecord, HistoricalQuery } from "./types";

export type DataSource = "historical" | "live";

const LIVE_URL =
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";
const QUERY_URL = "https://earthquake.usgs.gov/fdsnws/event/1/query";

type UsgsFeature = {
  id: string;
  properties: {
    mag: number | null;
    place: string | null;
    time: number;
    magType: string | null;
    net: string | null;
  };
  geometry: { coordinates: [number, number, number] };
};

type UsgsFeatureCollection = {
  features: UsgsFeature[];
};

const normalizeFeature = (feature: UsgsFeature): EarthquakeRecord => {
  const mag = feature.properties.mag ?? 0;
  const date = new Date(feature.properties.time);
  const [longitude, latitude, depth] = feature.geometry.coordinates;
  return {
    id: feature.id,
    year: String(date.getUTCFullYear()),
    time: date.toISOString(),
    latitude: String(latitude),
    longitude: String(longitude),
    depth: String(depth),
    mag: String(mag),
    magType: feature.properties.magType ?? "",
    place: feature.properties.place ?? "",
    magSource: feature.properties.net ?? "",
  };
};

const fetchYear = async (
  year: number,
  minMagnitude: number,
): Promise<UsgsFeature[]> => {
  const today = new Date();
  const isCurrentYear = year === today.getUTCFullYear();
  const start = `${year}-01-01`;
  const end = isCurrentYear
    ? today.toISOString().slice(0, 10)
    : `${year}-12-31`;
  const params = new URLSearchParams({
    format: "geojson",
    starttime: start,
    endtime: end,
    minmagnitude: String(minMagnitude),
    orderby: "time",
  });
  const response = await fetch(`${QUERY_URL}?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`USGS query for ${year} responded ${response.status}`);
  }
  const json = (await response.json()) as UsgsFeatureCollection;
  return json.features;
};

export const fetchHistoricalData = async (
  query: HistoricalQuery,
): Promise<EarthquakeRecord[]> => {
  const { startYear, endYear, minMagnitude } = query;
  const lo = Math.min(startYear, endYear);
  const hi = Math.max(startYear, endYear);
  const years: number[] = [];
  for (let y = lo; y <= hi; y++) years.push(y);
  const chunks = await Promise.all(
    years.map((y) => fetchYear(y, minMagnitude)),
  );
  return chunks.flat().map(normalizeFeature);
};

export const fetchLiveData = async (): Promise<EarthquakeRecord[]> => {
  const response = await fetch(LIVE_URL);
  if (!response.ok) {
    throw new Error(`USGS feed responded ${response.status}`);
  }
  const json = (await response.json()) as UsgsFeatureCollection;
  return json.features.map(normalizeFeature);
};
