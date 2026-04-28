import "./App.css";
import { useState } from "react";
import { buildMapData, computeQuakeNumber } from "./updateLogic";
import { useEarthquakeData } from "./hooks/useEarthquakeData";
import type { DataSource } from "./dataSources";
import { defaultHistoricalQuery, type HistoricalQuery } from "./types";
import StatCard from "./components/StatCard";
import RangeSliderCard from "./components/RangeSliderCard";
import DataSourceCard from "./components/DataSourceCard";
import PlaceSearchCard from "./components/PlaceSearchCard";
import EarthquakeMap from "./components/EarthquakeMap";

function App() {
  const [source, setSource] = useState<DataSource>("historical");
  const [historicalQuery, setHistoricalQuery] = useState<HistoricalQuery>(
    defaultHistoricalQuery,
  );
  const [placeSearch, setPlaceSearch] = useState("");
  const {
    filtered,
    bounds,
    magRange,
    setMagRange,
    lastUpdated,
    isLoading,
    error,
  } = useEarthquakeData(source, historicalQuery);

  const placeFiltered = placeSearch.trim()
    ? filtered?.filter((r) =>
        r.place.toLowerCase().includes(placeSearch.toLowerCase()),
      ) ?? null
    : filtered;

  const quakeNumber = placeFiltered ? computeQuakeNumber(placeFiltered) : null;
  const mapData = placeFiltered ? buildMapData(placeFiltered) : null;

  return (
    <div className="app-layout">
      <div className="controls-bar">
        <DataSourceCard
          source={source}
          onSourceChange={setSource}
          historicalQuery={historicalQuery}
          onHistoricalQueryChange={setHistoricalQuery}
          lastUpdated={lastUpdated}
          isLoading={isLoading}
          error={error}
        />
        {bounds && magRange && (
          <RangeSliderCard
            key={`mag-${source}`}
            id="mag-RangeSlider-container"
            title="Magnitude Range"
            min={bounds.mag[0]}
            max={bounds.mag[1]}
            step={0.1}
            value={magRange}
            onChange={setMagRange}
          />
        )}
        <PlaceSearchCard value={placeSearch} onChange={setPlaceSearch} />
        <StatCard
          id="shares-container2"
          title="Total earthquakes"
          value={quakeNumber}
        />
      </div>
      <EarthquakeMap mapData={mapData} />
    </div>
  );

}

export default App;
