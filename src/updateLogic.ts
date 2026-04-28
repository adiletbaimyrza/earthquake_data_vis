import { bubbleColorForMagnitude } from "./designTokens";
import type { EarthquakeRecord, MapData } from "./types";

export const computeQuakeNumber = (filtered: EarthquakeRecord[]): number =>
  filtered.length;



export const buildMapData = (data: EarthquakeRecord[]): MapData => {
  if (data.length === 0) {
    return {
      points: [],
      bounds: {
        longitude: [-180, 180],
        latitude: [-85, 85],
      },
      maxMagnitude: 0,
    };
  }

  const points = data.map((record) => {
    const longitude = Number.parseFloat(record.longitude);
    const latitude = Number.parseFloat(record.latitude);
    const magnitude = Number.parseFloat(record.mag);
    const depth = Number.parseFloat(record.depth);

    return {
      id: record.id,
      position: [longitude, latitude] as [number, number],
      mapRadius: Math.max((magnitude - 4) * 2.5 + 3, 3),
      fillColor: bubbleColorForMagnitude(magnitude),
      magnitude,
      depth,
      place: record.place,
      time: record.time,
      magType: record.magType,
      magSource: record.magSource,
    };
  });

  const longitudes = points.map((point) => point.position[0]);
  const latitudes = points.map((point) => point.position[1]);

  return {
    points,
    bounds: {
      longitude: [Math.min(...longitudes), Math.max(...longitudes)],
      latitude: [Math.min(...latitudes), Math.max(...latitudes)],
    },
    maxMagnitude: Math.max(...points.map((point) => point.magnitude), 0),
  };
};
