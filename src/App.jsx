import "./App.css";
import { useRef, useEffect, useState } from "react";
import Plotly from "plotly.js-dist";
import * as d3 from "d3";
import "chart.js/auto";
import { Chart } from "react-chartjs-2";
import { Slider, CircularProgress } from "@mui/material";
import {
  updateShares,
  updateQuakeNumber,
  updatePieChart,
  updateBarChart,
  updateLineChart,
  updateMap,
} from "./updateLogic";

const startingLongitude = -70.9;
const startingLatitude = 42.35;
const startingZoom = 8;

function App() {
  const [dataset, setDataset] = useState(null);

  const [shares, setShares] = useState(null);
  const [quakeNumber, setQuakeNumber] = useState(null);
  const [pieChartData, setPieChartData] = useState(null);
  const [barChartData, setBarChartData] = useState(null);
  const [lineChartData, setLineChartData] = useState(null);
  const [mapData, setMapData] = useState(null);

  const [magRange, setMagRange] = useState(null);
  const [yearRange, setYearRange] = useState(null);

  const minMag = useRef();
  const maxMag = useRef();
  const minYear = useRef();
  const maxYear = useRef();

  useEffect(() => {
    const updateAllOnFilter = (dataset) => {
      if (!dataset) return;

      const filteredData = dataset.filter((record) => {
        const mag = Number(record.mag);
        const year = Number(record.year);
        return (
          mag >= magRange[0] &&
          mag <= magRange[1] &&
          year >= yearRange[0] &&
          year <= yearRange[1]
        );
      });

      updateShares(filteredData, dataset, setShares);
      updateQuakeNumber(filteredData, setQuakeNumber);
      updatePieChart(filteredData, setPieChartData);
      updateBarChart(filteredData, setBarChartData);
      updateLineChart(filteredData, setLineChartData);
      updateMap(filteredData, setMapData);
    };

    updateAllOnFilter(dataset);
  }, [magRange, yearRange, dataset]);

  useEffect(() => {
    if (!mapData) return;

    var data = [
      {
        type: "scattermapbox",
        mode: "markers",
        lon: mapData.longitudes,
        lat: mapData.latitudes,
        marker: {
          color: mapData.colors,
          cmin: 0,
          cmax: 1.4,

          opacity: 0.8,
          size: mapData.bubbleSizes,
        },
      },
    ];

    var layout = {
      hovermode: "closest",
      mapbox: {
        style: "dark",
        bearing: 0,
        center: {
          lat: 45,
          lon: 26,
        },
        pitch: 0,
        zoom: 1,
        dragmode: "lasso",
      },
      margin: {
        r: 0,
        t: 0,
        b: 0,
        l: 0,
        pad: 0,
      },
    };

    Plotly.setPlotConfig({
      mapboxAccessToken:
        "MAPBOX_TOKEN_REMOVED",
    });

    if (document.getElementById("map-container").children.length === 0) {
      Plotly.newPlot("map-container", data, layout);
    } else {
      Plotly.react(
        "map-container",
        data,
        document.getElementById("map-container").layout,
      );
    }
  }, [mapData]);

  useEffect(() => {
    d3.csv("/src/usgs-dataset.csv").then((dataset) => {
      const magValues = dataset.map((record) => Number(record.mag));
      minMag.current = Math.min(...magValues);
      maxMag.current = Math.max(...magValues);
      setMagRange([minMag.current, maxMag.current]);

      const yearValues = dataset.map((record) => Number(record.year));
      minYear.current = Math.min(...yearValues);
      maxYear.current = Math.max(...yearValues);
      setYearRange([minYear.current, maxYear.current]);

      setDataset(dataset);
      initializeAll(dataset);
    });
  }, []);

  const initializeAll = (dataset) => {
    updateShares(dataset, dataset, setShares);
    updateQuakeNumber(dataset, setQuakeNumber);
    updatePieChart(dataset, setPieChartData);
    updateBarChart(dataset, setBarChartData);
    updateLineChart(dataset, setLineChartData);
    updateMap(dataset, setMapData);
  };

  return (
    <>
      <div id="mag-RangeSlider-container" className="card">
        <p className="title">Magnitutude Range</p>
        {magRange && (
          <Slider
            sx={{ marginTop: "2rem" }}
            valueLabelDisplay="auto"
            min={minMag.current}
            max={maxMag.current}
            step={0.1}
            defaultValue={magRange}
            onChange={(event) => {
              setMagRange(event.target.value);
            }}
          />
        )}
      </div>
      <div id="year-RangeSlider-container" className="card">
        <p className="title">Year Range</p>
        {yearRange && (
          <Slider
            sx={{ marginTop: "2rem" }}
            valueLabelDisplay="auto"
            min={minYear.current}
            max={maxYear.current}
            step={1}
            defaultValue={yearRange}
            onChange={(event) => {
              setYearRange(event.target.value);
            }}
          />
        )}
      </div>
      <div id="shares-container" className="card">
        <p className="title">Share of all earthquakes</p>
        <p className="shares title">{shares}%</p>
      </div>
      <div id="shares-container2" className="card">
        <p className="title">Total number of specified earthquakes</p>
        <p className="shares title">{quakeNumber}</p>
      </div>
      <div id="info" className="card">
        <p className="title">
          Need some help on abbreviations?{" "}
          <span className="link">Click me</span>
        </p>
      </div>
      <div id="magType-container" className="card">
        <p className="title">Magnitude Type Distribution</p>
        {pieChartData && (
          <Chart
            type={pieChartData.type}
            data={pieChartData.data}
            options={pieChartData.options}
          />
        )}
      </div>
      <div id="magSource-container" className="card">
        <p className="title">Top Contributors</p>
        {barChartData && (
          <Chart
            type={barChartData.type}
            data={barChartData.data}
            options={barChartData.options}
          ></Chart>
        )}
      </div>
      <div id="map-container" className="card"></div>
      <div id="mag-linechart-container" className="card">
        {lineChartData && (
          <Chart
            type={lineChartData.type}
            data={lineChartData.data}
            options={lineChartData.options}
          />
        )}
      </div>
    </>
  );
}

export default App;
