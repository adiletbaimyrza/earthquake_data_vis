import "./App.css";
import "chart.js/auto";
import { useState } from "react";
import {
  buildBarChart,
  buildLineChart,
  buildMapData,
  buildPieChart,
  computeQuakeNumber,
  computeSharesPercent,
} from "./updateLogic";
import { useEarthquakeData } from "./hooks/useEarthquakeData";
import type { DataSource } from "./dataSources";
import { defaultHistoricalQuery, type HistoricalQuery } from "./types";
import StatCard from "./components/StatCard";
import RangeSliderCard from "./components/RangeSliderCard";
import DataSourceCard from "./components/DataSourceCard";
import MagTypePieChart from "./components/MagTypePieChart";
import MagSourceBarChart from "./components/MagSourceBarChart";
import MagLineChart from "./components/MagLineChart";
import EarthquakeMap from "./components/EarthquakeMap";

function App() {
  const [source, setSource] = useState<DataSource>("historical");
  const [historicalQuery, setHistoricalQuery] = useState<HistoricalQuery>(
    defaultHistoricalQuery,
  );
  const {
    dataset,
    filtered,
    bounds,
    magRange,
    yearRange,
    setMagRange,
    setYearRange,
    lastUpdated,
    isLoading,
    error,
  } = useEarthquakeData(source, historicalQuery);

  const shares =
    filtered && dataset ? computeSharesPercent(filtered, dataset) : null;
  const quakeNumber = filtered ? computeQuakeNumber(filtered) : null;
  const pieConfig = filtered ? buildPieChart(filtered) : null;
  const barConfig = filtered ? buildBarChart(filtered) : null;
  const lineConfig = filtered ? buildLineChart(filtered) : null;
  const mapData = filtered ? buildMapData(filtered) : null;

  return (
    <>
      {bounds && magRange && (
        <RangeSliderCard
          key={`mag-${source}`}
          id="mag-RangeSlider-container"
          title="Magnitutude Range"
          min={bounds.mag[0]}
          max={bounds.mag[1]}
          step={0.1}
          value={magRange}
          onChange={setMagRange}
        />
      )}
      {bounds && yearRange && (
        <RangeSliderCard
          key={`year-${source}`}
          id="year-RangeSlider-container"
          title="Year Range"
          min={bounds.year[0]}
          max={bounds.year[1]}
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
      <DataSourceCard
        source={source}
        onSourceChange={setSource}
        historicalQuery={historicalQuery}
        onHistoricalQueryChange={setHistoricalQuery}
        lastUpdated={lastUpdated}
        isLoading={isLoading}
        error={error}
      />
      <MagTypePieChart config={pieConfig} />
      <MagSourceBarChart config={barConfig} />
      <EarthquakeMap mapData={mapData} />
      <MagLineChart config={lineConfig} />
    </>
  );
}

export default App;
