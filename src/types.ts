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
