import { useEffect, useRef } from "react";
import Plotly from "plotly.js-dist";
import type { MapData } from "../types";

const MAPBOX_TOKEN =
  "MAPBOX_TOKEN_REMOVED";

type Props = { mapData: MapData | null };

const EarthquakeMap = ({ mapData }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapData || !containerRef.current) return;

    const data = [
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

    const layout = {
      hovermode: "closest",
      mapbox: {
        style: "dark",
        bearing: 0,
        center: { lat: 45, lon: 26 },
        pitch: 0,
        zoom: 1,
        dragmode: "lasso",
      },
      margin: { r: 0, t: 0, b: 0, l: 0, pad: 0 },
    };

    Plotly.setPlotConfig({ mapboxAccessToken: MAPBOX_TOKEN });

    const container = containerRef.current;
    if (container.children.length === 0) {
      Plotly.newPlot(container, data, layout);
    } else {
      Plotly.react(container, data, layout);
    }
  }, [mapData]);

  return <div id="map-container" className="card" ref={containerRef}></div>;
};

export default EarthquakeMap;
