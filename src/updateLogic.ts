import type { ChartConfig, EarthquakeRecord, MapData, RgbaColor } from "./types";

export const computeSharesPercent = (
  filtered: EarthquakeRecord[],
  all: EarthquakeRecord[],
): string => ((filtered.length / all.length) * 100).toFixed(1);

export const computeQuakeNumber = (filtered: EarthquakeRecord[]): number =>
  filtered.length;

const parseHexColor = (value: string): RgbaColor => {
  const normalized = value.trim();
  const hex = normalized.startsWith("#") ? normalized.slice(1) : normalized;
  const expanded =
    hex.length === 3
      ? hex
          .split("")
          .map((char) => `${char}${char}`)
          .join("")
      : hex;

  if (!/^[0-9a-fA-F]{6}$/.test(expanded)) {
    return [255, 128, 0, 220];
  }

  return [
    Number.parseInt(expanded.slice(0, 2), 16),
    Number.parseInt(expanded.slice(2, 4), 16),
    Number.parseInt(expanded.slice(4, 6), 16),
    220,
  ];
};

const countBy = (
  records: EarthquakeRecord[],
  key: keyof EarthquakeRecord,
): Record<string, number> =>
  records.reduce<Record<string, number>>((counts, record) => {
    const bucket = record[key];
    counts[bucket] = (counts[bucket] || 0) + 1;
    return counts;
  }, {});

export const buildPieChart = (data: EarthquakeRecord[]): ChartConfig<"pie"> => {
  const counts = countBy(data, "magType");
  return {
    type: "pie",
    data: {
      labels: Object.keys(counts),
      datasets: [
        {
          label: "Records by Magnitude Type",
          data: Object.values(counts),
        },
      ],
    },
    options: { aspectRatio: 1.1 },
  };
};

export const buildBarChart = (data: EarthquakeRecord[]): ChartConfig<"bar"> => {
  const counts = countBy(data, "magSource");
  const top3 = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return {
    type: "bar",
    data: {
      labels: top3.map(([label]) => label),
      datasets: [
        {
          label: "Records by Source Type",
          data: top3.map(([, value]) => value),
        },
      ],
    },
    options: {
      scales: { y: { beginAtZero: true } },
      aspectRatio: 1.1,
    },
  };
};

export const buildLineChart = (
  data: EarthquakeRecord[],
): ChartConfig<"line"> => {
  const counts = countBy(data, "mag");

  return {
    type: "line",
    data: {
      labels: Object.keys(counts),
      datasets: [
        {
          label: "Number of earthquakes",
          data: Object.values(counts),
          fill: true,
          backgroundColor: "rgba(75,192,192,0.4)",
          borderColor: "rgba(75,192,192,1)",
        },
      ],
    },
    options: { aspectRatio: 6.4 },
  };
};

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
    const bubbleSize = Number.parseFloat(record.bubble_size);

    return {
      id: record.id,
      position: [longitude, latitude] as [number, number],
      mapRadius: Math.max(bubbleSize * 1.8, 3),
      globeRadius: Math.max(bubbleSize * 22000, 12000),
      fillColor: parseHexColor(record.color),
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
