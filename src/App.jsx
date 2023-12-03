import "./App.css";
import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import Plotly from "plotly.js-dist-min";

mapboxgl.accessToken =
  "MAPBOX_TOKEN_REMOVED";

function App() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-70.9);
  const [lat, setLat] = useState(42.35);
  const [zoom, setZoom] = useState(9);

  useEffect(() => {
    if (map.current) return;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [lng, lat],
      zoom: zoom,
    });
  });

  return (
    <>
      <div id="mag-RangeSlider-container" className="card"></div>
      <div id="year-RangeSlider-container" className="card"></div>
      <div id="shares-container" className="card"></div>
      <div id="info" className="card"></div>
      <div id="magType-container" className="card"></div>
      <div id="magSource-container" className="card"></div>
      <div ref={mapContainer} id="map-container" className="card"></div>
      <div id="mag-linechart-container" className="card"></div>
    </>
  );
}

export default App;
