import type { ChartConfig, EarthquakeRecord, MapData } from "./types";

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

export const buildMapData = (data: EarthquakeRecord[]): MapData => ({
  longitudes: data.map((r) => parseFloat(r.longitude)),
  latitudes: data.map((r) => parseFloat(r.latitude)),
  bubbleSizes: data.map((r) => parseFloat(r.bubble_size)),
  colors: data.map((r) => r.color),
});
