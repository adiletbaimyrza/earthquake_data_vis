import type { ChartData, ChartOptions, ChartType } from "chart.js";

export type EarthquakeRecord = {
  id: string;
  year: string;
  time: string;
  latitude: string;
  longitude: string;
  depth: string;
  mag: string;
  magType: string;
  place: string;
  magSource: string;
  bubble_size: string;
  color: string;
};

export type Range = [number, number];

export type MapData = {
  longitudes: number[];
  latitudes: number[];
  bubbleSizes: number[];
  colors: string[];
};

export type ChartConfig<T extends ChartType> = {
  type: T;
  data: ChartData<T>;
  options: ChartOptions<T>;
};

export type HistoricalQuery = {
  startYear: number;
  endYear: number;
  minMagnitude: number;
};

export const HISTORICAL_MIN_YEAR = 1900;
export const HISTORICAL_MAGNITUDE_OPTIONS = [2.5, 4.5, 5.0, 6.0, 7.0] as const;

export const defaultHistoricalQuery = (): HistoricalQuery => {
  const currentYear = new Date().getUTCFullYear();
  return {
    startYear: currentYear - 4,
    endYear: currentYear,
    minMagnitude: 4.5,
  };
};
