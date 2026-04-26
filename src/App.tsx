import "./App.css";
import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import "chart.js/auto";
import {
  buildBarChart,
  buildLineChart,
  buildMapData,
  buildPieChart,
  computeQuakeNumber,
  computeSharesPercent,
} from "./updateLogic";
import type { EarthquakeRecord, Range } from "./types";
import StatCard from "./components/StatCard";
import RangeSliderCard from "./components/RangeSliderCard";
import InfoCard from "./components/InfoCard";
import MagTypePieChart from "./components/MagTypePieChart";
import MagSourceBarChart from "./components/MagSourceBarChart";
import MagLineChart from "./components/MagLineChart";
import EarthquakeMap from "./components/EarthquakeMap";

function App() {
  const [dataset, setDataset] = useState<EarthquakeRecord[] | null>(null);
  const [magRange, setMagRange] = useState<Range | null>(null);
  const [yearRange, setYearRange] = useState<Range | null>(null);

  const minMag = useRef<number>(0);
  const maxMag = useRef<number>(0);
  const minYear = useRef<number>(0);
  const maxYear = useRef<number>(0);

  useEffect(() => {
    d3.csv("/usgs-dataset.csv").then((rows) => {
      const loaded = rows as unknown as EarthquakeRecord[];
      const magValues = loaded.map((r) => Number(r.mag));
      minMag.current = Math.min(...magValues);
      maxMag.current = Math.max(...magValues);

      const yearValues = loaded.map((r) => Number(r.year));
      minYear.current = Math.min(...yearValues);
      maxYear.current = Math.max(...yearValues);

      setMagRange([minMag.current, maxMag.current]);
      setYearRange([minYear.current, maxYear.current]);
      setDataset(loaded);
    });
  }, []);

  const filtered = useMemo(() => {
    if (!dataset || !magRange || !yearRange) return null;
    return dataset.filter((record) => {
      const mag = Number(record.mag);
      const year = Number(record.year);
      return (
        mag >= magRange[0] &&
        mag <= magRange[1] &&
        year >= yearRange[0] &&
        year <= yearRange[1]
      );
    });
  }, [dataset, magRange, yearRange]);

  const shares =
    filtered && dataset ? computeSharesPercent(filtered, dataset) : null;
  const quakeNumber = filtered ? computeQuakeNumber(filtered) : null;
  const pieConfig = filtered ? buildPieChart(filtered) : null;
  const barConfig = filtered ? buildBarChart(filtered) : null;
  const lineConfig = filtered ? buildLineChart(filtered) : null;
  const mapData = filtered ? buildMapData(filtered) : null;

  return (
    <>
      {magRange && (
        <RangeSliderCard
          id="mag-RangeSlider-container"
          title="Magnitutude Range"
          min={minMag.current}
          max={maxMag.current}
          step={0.1}
          value={magRange}
          onChange={setMagRange}
        />
      )}
      {yearRange && (
        <RangeSliderCard
          id="year-RangeSlider-container"
          title="Year Range"
          min={minYear.current}
          max={maxYear.current}
          step={1}
          value={yearRange}
          onChange={setYearRange}
        />
      )}
      <StatCard
        id="shares-container"
        title="Share of all earthquakes"
        value={shares}
        suffix="%"
      />
      <StatCard
        id="shares-container2"
        title="Total number of specified earthquakes"
        value={quakeNumber}
      />
      <InfoCard />
      <MagTypePieChart config={pieConfig} />
      <MagSourceBarChart config={barConfig} />
      <EarthquakeMap mapData={mapData} />
      <MagLineChart config={lineConfig} />
    </>
  );
}

export default App;
