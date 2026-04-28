import { useEffect, useMemo, useState } from "react";
import {
  fetchHistoricalData,
  fetchLiveData,
  type DataSource,
} from "../dataSources";
import type { EarthquakeRecord, HistoricalQuery, Range } from "../types";

const LIVE_REFRESH_MS = 5 * 60 * 1000;

export type Bounds = { mag: Range };

export type UseEarthquakeData = {
  dataset: EarthquakeRecord[] | null;
  filtered: EarthquakeRecord[] | null;
  bounds: Bounds | null;
  magRange: Range | null;
  setMagRange: (next: Range) => void;
  lastUpdated: Date | null;
  isLoading: boolean;
  error: Error | null;
};

const computeBounds = (dataset: EarthquakeRecord[]): Bounds => {
  if (dataset.length === 0) return { mag: [0, 0] };
  const magValues = dataset.map((r) => Number(r.mag));
  return { mag: [Math.min(...magValues), Math.max(...magValues)] };
};

export const useEarthquakeData = (
  source: DataSource,
  historicalQuery: HistoricalQuery,
): UseEarthquakeData => {
  const [dataset, setDataset] = useState<EarthquakeRecord[] | null>(null);
  const [bounds, setBounds] = useState<Bounds | null>(null);
  const [magRange, setMagRange] = useState<Range | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async (resetRanges: boolean) => {
      setIsLoading(true);
      setError(null);
      try {
        const data =
          source === "live"
            ? await fetchLiveData()
            : await fetchHistoricalData(historicalQuery);
        if (cancelled) return;
        const nextBounds = computeBounds(data);
        setDataset(data);
        setBounds(nextBounds);
        setLastUpdated(new Date());
        if (resetRanges) {
          setMagRange(nextBounds.mag);
        }
      } catch (err) {
        if (!cancelled) setError(err as Error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load(true);

    let intervalId: number | undefined;
    if (source === "live") {
      intervalId = window.setInterval(() => load(false), LIVE_REFRESH_MS);
    }

    return () => {
      cancelled = true;
      if (intervalId !== undefined) window.clearInterval(intervalId);
    };
  }, [source, historicalQuery]);

  const filtered = useMemo(() => {
    if (!dataset || !magRange) return null;
    return dataset.filter((record) => {
      const mag = Number(record.mag);
      return mag >= magRange[0] && mag <= magRange[1];
    });
  }, [dataset, magRange]);

  return {
    dataset,
    filtered,
    bounds,
    magRange,
    setMagRange,
    lastUpdated,
    isLoading,
    error,
  };
};
