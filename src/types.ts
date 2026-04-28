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
};

export type Range = [number, number];

export type RgbaColor = [number, number, number, number];

export type MapPoint = {
  id: string;
  position: [number, number];
  mapRadius: number;
  fillColor: RgbaColor;
  magnitude: number;
  depth: number;
  place: string;
  time: string;
  magType: string;
  magSource: string;
};

export type MapData = {
  points: MapPoint[];
  bounds: {
    longitude: Range;
    latitude: Range;
  };
  maxMagnitude: number;
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
