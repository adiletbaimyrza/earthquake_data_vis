import { useEffect, useMemo, useState } from "react";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { MapView, _GlobeView as GlobeView, type PickingInfo } from "@deck.gl/core";
import { GeoJsonLayer, PathLayer, PolygonLayer, ScatterplotLayer } from "@deck.gl/layers";
import DeckGL from "@deck.gl/react";
import type { MapData, MapPoint } from "../types";

type Props = { mapData: MapData | null };

type ViewMode = "map" | "globe";

type DeckViewState = {
  longitude?: number;
  latitude?: number;
  zoom?: number;
  pitch?: number;
  bearing?: number;
};

type ControlledViewState = {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
};

type ViewStateChangeArgs = {
  viewState: DeckViewState;
  interactionState?: {
    isDragging?: boolean;
    isPanning?: boolean;
    isRotating?: boolean;
    isZooming?: boolean;
  };
};

type GraticulePath = {
  id: string;
  path: [number, number][];
};

const WORLD_SURFACE = [
  {
    id: "world-surface",
    polygon: [
      [-180, 90],
      [0, 90],
      [180, 90],
      [180, -90],
      [0, -90],
      [-180, -90],
    ] as [number, number][],
  },
];
const LAND_DATA_URL = `${import.meta.env.BASE_URL}ne_110m_land.geojson`;
const OCEAN_COLOR: [number, number, number, number] = [8, 28, 44, 255];
const LAND_COLOR: [number, number, number, number] = [46, 78, 64, 255];

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const wrapLongitude = (longitude: number): number => {
  let next = longitude;
  while (next > 180) next -= 360;
  while (next < -180) next += 360;
  return next;
};

const getGlobeBubbleRadius = (point: MapPoint, zoom: number): number => {
  const zoomScale = 1 / Math.pow(1.45, Math.max(0, zoom));
  return clamp(point.mapRadius * 0.9 * zoomScale, 1.5, 12);
};

const buildGraticule = (): GraticulePath[] => {
  const paths: GraticulePath[] = [];

  for (let latitude = -60; latitude <= 60; latitude += 30) {
    const path: [number, number][] = [];
    for (let longitude = -180; longitude <= 180; longitude += 6) {
      path.push([longitude, latitude]);
    }
    paths.push({ id: `lat-${latitude}`, path });
  }

  for (let longitude = -150; longitude <= 180; longitude += 30) {
    const path: [number, number][] = [];
    for (let latitude = -84; latitude <= 84; latitude += 4) {
      path.push([longitude, latitude]);
    }
    paths.push({ id: `lon-${longitude}`, path });
  }

  return paths;
};

const GRATICULE = buildGraticule();

const createMapViewState = (mapData: MapData | null): ControlledViewState => {
  const [minLon, maxLon] = mapData?.bounds.longitude ?? [-180, 180];
  const [minLat, maxLat] = mapData?.bounds.latitude ?? [-85, 85];
  const lonSpan = Math.max(30, maxLon - minLon);
  const latSpan = Math.max(18, maxLat - minLat);
  const maxSpan = Math.max(lonSpan, latSpan * 1.5);

  return {
    longitude: clamp((minLon + maxLon) / 2, -170, 170),
    latitude: clamp((minLat + maxLat) / 2, -70, 70),
    zoom: clamp(Math.log2(360 / maxSpan) - 0.2, 0.45, 4.4),
    pitch: 28,
    bearing: 0,
  };
};

const createGlobeViewState = (mapData: MapData | null): ControlledViewState => {
  const [minLon, maxLon] = mapData?.bounds.longitude ?? [-180, 180];
  const [minLat, maxLat] = mapData?.bounds.latitude ?? [-85, 85];

  return {
    longitude: clamp((minLon + maxLon) / 2, -170, 170),
    latitude: clamp((minLat + maxLat) / 2, -50, 50),
    zoom: 0.15,
    pitch: 0,
    bearing: 0,
  };
};

const normalizeViewState = (viewState: DeckViewState): ControlledViewState => ({
  longitude: viewState.longitude ?? 0,
  latitude: clamp(viewState.latitude ?? 0, -80, 80),
  zoom: viewState.zoom ?? 0,
  pitch: viewState.pitch ?? 0,
  bearing: viewState.bearing ?? 0,
});

const formatTooltip = (point: MapPoint): string =>
  [
    point.place || "Unknown location",
    `Magnitude ${point.magnitude.toFixed(1)} (${point.magType || "n/a"})`,
    `Depth ${point.depth.toFixed(1)} km`,
    `Source ${point.magSource || "n/a"}`,
    new Date(point.time).toLocaleString(),
  ].join("\n");

const EarthquakeMap = ({ mapData }: Props) => {
  const [viewMode, setViewMode] = useState<ViewMode>("map");
  const [isAutoRotateEnabled, setIsAutoRotateEnabled] = useState<boolean>(false);
  const [mapViewState, setMapViewState] = useState<ControlledViewState>(() =>
    createMapViewState(mapData),
  );
  const [globeViewState, setGlobeViewState] = useState<ControlledViewState>(() =>
    createGlobeViewState(mapData),
  );

  useEffect(() => {
    setMapViewState(createMapViewState(mapData));
    setGlobeViewState(createGlobeViewState(mapData));
  }, [mapData]);

  useEffect(() => {
    setIsAutoRotateEnabled(viewMode === "globe");
  }, [viewMode]);

  useEffect(() => {
    if (viewMode !== "globe" || !isAutoRotateEnabled) return;

    let animationFrameId = 0;
    let previousTimestamp = 0;

    const rotate = (timestamp: number) => {
      if (previousTimestamp === 0) {
        previousTimestamp = timestamp;
      }
      const elapsedSeconds = (timestamp - previousTimestamp) / 1000;
      previousTimestamp = timestamp;

      setGlobeViewState((current) => ({
        ...current,
        longitude: wrapLongitude(current.longitude - elapsedSeconds * 6),
      }));

      animationFrameId = window.requestAnimationFrame(rotate);
    };

    animationFrameId = window.requestAnimationFrame(rotate);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [isAutoRotateEnabled, viewMode]);

  const points = mapData?.points ?? [];
  const hasData = points.length > 0;
  const globeZoom = globeViewState.zoom;

  const baseLayers = useMemo(
    () => [
      new PolygonLayer({
        id: "surface",
        data: WORLD_SURFACE,
        getPolygon: (item: (typeof WORLD_SURFACE)[number]) => item.polygon,
        getFillColor: OCEAN_COLOR,
        parameters:
          viewMode === "globe"
            ? {
                polygonOffsetFill: true,
                polygonOffset: [1, 1],
              }
            : undefined,
        stroked: false,
        pickable: false,
      }),
      new GeoJsonLayer({
        id: "landmasses",
        data: LAND_DATA_URL,
        getFillColor: LAND_COLOR,
        parameters:
          viewMode === "globe"
            ? {
                polygonOffsetFill: true,
                polygonOffset: [0, -2],
              }
            : undefined,
        filled: true,
        stroked: false,
        pickable: false,
      }),
      new PathLayer<GraticulePath>({
        id: "graticule",
        data: GRATICULE,
        getPath: (item) => item.path,
        getColor: viewMode === "map" ? [88, 114, 135, 58] : [78, 102, 124, 90],
        widthMinPixels: 1,
        pickable: false,
      }),
    ],
    [viewMode],
  );

  const quakeLayer = useMemo(
    () =>
      new ScatterplotLayer<MapPoint>({
        id: "earthquakes",
        data: points,
        getPosition: (point) => point.position,
        getRadius: (point) =>
          viewMode === "map"
            ? point.mapRadius
            : getGlobeBubbleRadius(point, globeZoom),
        radiusUnits: "pixels",
        radiusMinPixels: viewMode === "map" ? 2 : 1.5,
        radiusMaxPixels: viewMode === "map" ? 26 : 12,
        getFillColor: (point) => point.fillColor,
        stroked: false,
        filled: true,
        opacity: 0.76,
        pickable: true,
        autoHighlight: false,
      }),
    [globeZoom, points, viewMode],
  );

  const currentViewState = viewMode === "map" ? mapViewState : globeViewState;
  const currentView = useMemo(
    () =>
      viewMode === "map"
        ? new MapView({ id: "earthquake-map", repeat: true })
        : new GlobeView({ id: "earthquake-globe" }),
    [viewMode],
  );

  return (
    <div id="map-container" className="card">
      <div className="map-shell">
        <div className="map-toolbar">
          <div>
            <p className="map-title">Epicenter Density</p>
            <p className="map-subtitle">
              `deck.gl` scatter renderer with a flat map and globe projection.
            </p>
          </div>
          <div className="map-controls">
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              size="small"
              onChange={(_, next: ViewMode | null) => {
                if (next) setViewMode(next);
              }}
              sx={{
                backgroundColor: "rgba(5, 12, 22, 0.65)",
                borderRadius: "999px",
                "& .MuiToggleButton-root": {
                  color: "rgba(255,255,255,0.78)",
                  borderColor: "rgba(255,255,255,0.16)",
                  paddingInline: "0.9rem",
                },
                "& .Mui-selected": {
                  color: "#ffb25b !important",
                  backgroundColor: "rgba(255,128,0,0.16) !important",
                  borderColor: "rgba(255,128,0,0.5) !important",
                },
              }}
            >
              <ToggleButton value="map">Map</ToggleButton>
              <ToggleButton value="globe">Globe</ToggleButton>
            </ToggleButtonGroup>
            {viewMode === "globe" && (
              <ToggleButton
                value="auto-rotate"
                selected={isAutoRotateEnabled}
                size="small"
                onChange={() =>
                  setIsAutoRotateEnabled((current) => !current)
                }
                sx={{
                  color: "rgba(255,255,255,0.78)",
                  borderColor: "rgba(255,255,255,0.16)",
                  borderRadius: "999px",
                  backgroundColor: "rgba(5, 12, 22, 0.65)",
                  paddingInline: "0.9rem",
                  "&.Mui-selected": {
                    color: "#ffb25b",
                    backgroundColor: "rgba(255,128,0,0.16)",
                    borderColor: "rgba(255,128,0,0.5)",
                  },
                }}
              >
                Auto-Rotate
              </ToggleButton>
            )}
          </div>
        </div>

        {hasData ? (
          <DeckGL
            key={viewMode}
            style={{ position: "absolute", inset: "0" }}
            views={currentView}
            controller={true}
            useDevicePixels={1}
            parameters={
              viewMode === "globe" ? ({ cull: true } as never) : undefined
            }
            viewState={currentViewState}
            onViewStateChange={({
              viewState,
              interactionState,
            }: ViewStateChangeArgs) => {
              const next = normalizeViewState(viewState as DeckViewState);
              if (viewMode === "map") {
                setMapViewState(next);
              } else {
                if (
                  interactionState?.isDragging ||
                  interactionState?.isPanning ||
                  interactionState?.isRotating ||
                  interactionState?.isZooming
                ) {
                  setIsAutoRotateEnabled(false);
                }
                setGlobeViewState(next);
              }
            }}
            layers={[...baseLayers, quakeLayer]}
            getTooltip={({ object }: PickingInfo<MapPoint>) =>
              object ? { text: formatTooltip(object) } : null
            }
          />
        ) : (
          <div className="map-empty">
            No earthquakes match the current filters.
          </div>
        )}

        <div className="map-legend">
          <span>{points.length.toLocaleString()} earthquakes</span>
          <span>
            max M{mapData?.maxMagnitude.toFixed(1) ?? "0.0"}
          </span>
          <span>Orange/red points indicate stronger events</span>
        </div>
      </div>
    </div>
  );
};

export default EarthquakeMap;
