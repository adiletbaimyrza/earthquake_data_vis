import "./App.css";
import { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import * as d3 from "d3";
import "chart.js/auto";
import { Chart } from "react-chartjs-2";
import { Slider } from "@mui/material";

mapboxgl.accessToken =
  "MAPBOX_TOKEN_REMOVED";

function App() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-70.9);
  const [lat, setLat] = useState(42.35);
  const [zoom, setZoom] = useState(9);

  const [pieChartData, setPieChartData] = useState(null);
  const [barChartData, setBarChartData] = useState(null);
  const [areaChartData, setAreaChartData] = useState(null);

  useEffect(() => {
    if (map.current) return;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [lng, lat],
      zoom: zoom,
    });
  });

  useEffect(() => {
    d3.csv("/src/usgs-dataset.csv").then((dataset) => makeCharts(dataset));
  }, []);

  const makeCharts = (dataset) => {
    const pieChartData = dataset.reduce((counts, record) => {
      const magType = record.magType;
      counts[magType] = (counts[magType] || 0) + 1;
      return counts;
    }, {});

    const pieChartLabels = Object.keys(pieChartData);
    const pieChartValues = Object.values(pieChartData);

    setPieChartData({
      type: "pie",
      data: {
        labels: pieChartLabels,
        datasets: [
          {
            label: "Records by Magnitude Type",
            data: pieChartValues,
          },
        ],
      },
      options: {
        aspectRatio: 1.1,
      },
    });

    const barChartData = dataset.reduce((counts, record) => {
      const magSource = record.magSource;
      counts[magSource] = (counts[magSource] || 0) + 1;
      return counts;
    }, {});

    const sortedBarChartData = Object.entries(barChartData)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    const sortedBarChartDataJSON = Object.fromEntries(sortedBarChartData);

    const barChartLabels = Object.keys(sortedBarChartDataJSON);
    const barChartValues = Object.values(sortedBarChartDataJSON);

    setBarChartData({
      type: "bar",
      data: {
        labels: barChartLabels,
        datasets: [
          {
            label: "Records by Source Type",
            data: barChartValues,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
        aspectRatio: 1.1,
      },
    });

    const areaChartData = dataset.reduce((counts, record) => {
      const mag = record.mag;
      counts[mag] = (counts[mag] || 0) + 1;
      return counts;
    }, {});

    const areaChartLabels = Object.keys(areaChartData);
    const areaChartValues = Object.values(areaChartData);

    setAreaChartData({
      type: "line",
      data: {
        labels: areaChartLabels,
        datasets: [
          {
            label: "Number of earthquakes",
            data: areaChartValues.map((value, index) => ({
              x: areaChartLabels[index],
              y: value,
              label: `Custom label for point ${index}`,
            })),
            fill: true, // This will fill the area under the line
            backgroundColor: "rgba(75,192,192,0.4)",
            borderColor: "rgba(75,192,192,1)",
          },
        ],
      },
      options: {
        aspectRatio: 6.4,
      },
    });
  };

  return (
    <>
      <div id="mag-RangeSlider-container" className="card">
        <p className="title">Magnitutude Range</p>
        <Slider sx={{ marginTop: "2rem" }} valueLabelDisplay="auto" />
      </div>
      <div id="year-RangeSlider-container" className="card">
        <p className="title">Year Range</p>
        <Slider sx={{ marginTop: "2rem" }} valueLabelDisplay="auto" />
      </div>
      <div id="shares-container" className="card">
        <p className="title">Share of all earthquakes</p>
        <p className="shares title">100%</p>
      </div>
      <div id="shares-container2" className="card">
        <p className="title">Total number of specified earthquakes</p>
        <p className="shares title">8000</p>
      </div>
      <div id="info" className="card">
        <p className="title">Need some help on abbreviations? Click me</p>
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
      <div ref={mapContainer} id="map-container" className="card"></div>
      <div id="mag-linechart-container" className="card">
        {areaChartData && (
          <Chart
            type={areaChartData.type}
            data={areaChartData.data}
            options={areaChartData.options}
          />
        )}
      </div>
    </>
  );
}

export default App;
