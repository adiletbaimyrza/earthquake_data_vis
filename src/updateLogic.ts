import { DESIGN_COLORS, bubbleColorForMagnitude } from "./designTokens";
import type { ChartConfig, EarthquakeRecord, MapData } from "./types";

const CHART_MONO = '"JetBrains Mono", monospace';
const INK_SECONDARY = DESIGN_COLORS.ink1;
const INK_TERTIARY = DESIGN_COLORS.ink2;
const LINE = DESIGN_COLORS.line;
const ACCENT = DESIGN_COLORS.accent;
const ACCENT_WARM = DESIGN_COLORS.accentWarm;
const ACCENT_COOL = DESIGN_COLORS.accentCool;
const DANGER = DESIGN_COLORS.danger;
const PIE_COLORS = [ACCENT, ACCENT_WARM, ACCENT_COOL, DANGER, "#7F8EA3"];

export const computeSharesPercent = (
  filtered: EarthquakeRecord[],
  all: EarthquakeRecord[],
): string => ((filtered.length / all.length) * 100).toFixed(1);

export const computeQuakeNumber = (filtered: EarthquakeRecord[]): number =>
  filtered.length;

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
          backgroundColor: PIE_COLORS,
          borderColor: "#11141A",
          borderWidth: 1,
        },
      ],
    },
    options: {
      aspectRatio: 1.1,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: INK_SECONDARY,
            font: { family: CHART_MONO, size: 10 },
            padding: 18,
          },
        },
      },
    },
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
          backgroundColor: [ACCENT, ACCENT_WARM, ACCENT_COOL],
          borderRadius: 4,
          borderSkipped: false,
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          labels: {
            color: INK_SECONDARY,
            font: { family: CHART_MONO, size: 10 },
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: INK_SECONDARY,
            font: { family: CHART_MONO, size: 10 },
          },
          grid: { display: false },
          border: { color: LINE },
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: INK_TERTIARY,
            font: { family: CHART_MONO, size: 10 },
          },
          grid: { color: LINE },
          border: { color: LINE },
        },
      },
      aspectRatio: 1.1,
    },
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
