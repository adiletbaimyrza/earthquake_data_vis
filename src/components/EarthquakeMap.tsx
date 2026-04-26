import { useEffect, useMemo, useState } from "react";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import {
  MapView,
  _GlobeView as GlobeView,
  type PickingInfo,
} from "@deck.gl/core";
import {
  GeoJsonLayer,
  PathLayer,
  PolygonLayer,
  ScatterplotLayer,
} from "@deck.gl/layers";
import DeckGL from "@deck.gl/react";
import {
  MAP_GRATICULE_GLOBE_RGBA,
  MAP_GRATICULE_MAP_RGBA,
  MAP_LAND_GLOBE_RGBA,
  MAP_LAND_GLOBE_STROKE_RGBA,
  MAP_LAND_RGBA,
  MAP_OCEAN_RGBA,
  bubbleGlowColorForMagnitude,
} from "../designTokens";
import type { MapData, MapPoint, RgbaColor } from "../types";

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

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const wrapLongitude = (longitude: number): number => {
  let next = longitude;
  while (next > 180) next -= 360;
  while (next < -180) next += 360;
  return next;
};

const getGlobeBubbleRadius = (point: MapPoint, zoom: number, totalPoints: number): number => {
  const densityFactor = Math.max(0.25, Math.min(1.0, 1500 / totalPoints));
  const zoomFactor = 0.4 + zoom * 0.15;
  return clamp(point.mapRadius * densityFactor * zoomFactor, 0.8, 16);
};

const getMapBubbleRadius = (point: MapPoint, zoom: number, totalPoints: number): number => {
  const densityFactor = Math.max(0.3, Math.min(1.0, 1200 / totalPoints));
  const zoomFactor = 0.5 + zoom * 0.2;
  return point.mapRadius * densityFactor * zoomFactor;
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
    zoom: 2.5,
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
  const [viewMode, setViewMode] = useState<ViewMode>("globe");
  const [isAutoRotateEnabled, setIsAutoRotateEnabled] =
    useState<boolean>(false);
  const [mapViewState, setMapViewState] = useState<ControlledViewState>(() =>
    createMapViewState(mapData),
  );
  const [globeViewState, setGlobeViewState] = useState<ControlledViewState>(
    () => createGlobeViewState(mapData),
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

  const points = useMemo(() => mapData?.points ?? [], [mapData]);
  const hasData = points.length > 0;
  const globeZoom = globeViewState.zoom;
  const mapZoom = mapViewState.zoom;

  const visiblePoints = useMemo(() => {
    if (points.length === 0) return [];

    const currentZoom = viewMode === "map" ? mapZoom : globeZoom;
    const magThreshold =
      currentZoom < 0.5 ? 6.5 : currentZoom < 1.2 ? 5.5 : currentZoom < 2.0 ? 4.5 : 0;

    let filtered = points.filter((p) => p.magnitude >= magThreshold);

    if (viewMode === "globe") {
      const { longitude: cLon, latitude: cLat } = globeViewState;
      const degToRad = Math.PI / 180;
      const phi1 = cLat * degToRad;
      const lambda0 = cLon * degToRad;

      filtered = filtered.filter((p) => {
        const phi = p.position[1] * degToRad;
        const lambda = p.position[0] * degToRad;
        const cosDiff =
          Math.sin(phi1) * Math.sin(phi) +
          Math.cos(phi1) * Math.cos(phi) * Math.cos(lambda - lambda0);
        return cosDiff > -0.1;
      });
    }

    return filtered.sort((a, b) => a.magnitude - b.magnitude);
  }, [points, viewMode, mapZoom, globeZoom, globeViewState]);

  const baseLayers = useMemo(
    () => [
      ...(viewMode === "globe"
        ? [
            new ScatterplotLayer({
              id: "globe-atmosphere-glow-outer",
              data: [{ position: [0, 0, -6370997] }],
              getPosition: (d) => d.position as [number, number, number],
              getRadius: 6370997 * 1.15,
              radiusUnits: "meters",
              getFillColor: [232, 116, 60, 10],
              stroked: false,
              billboard: true,
              pickable: false,
            }),
            new ScatterplotLayer({
              id: "globe-atmosphere-glow-mid",
              data: [{ position: [0, 0, -6370997] }],
              getPosition: (d) => d.position as [number, number, number],
              getRadius: 6370997 * 1.08,
              radiusUnits: "meters",
              getFillColor: [232, 116, 60, 25],
              stroked: false,
              billboard: true,
              pickable: false,
            }),
            new ScatterplotLayer({
              id: "globe-atmosphere-glow-inner",
              data: [{ position: [0, 0, -6370997] }],
              getPosition: (d) => d.position as [number, number, number],
              getRadius: 6370997 * 1.03,
              radiusUnits: "meters",
              getFillColor: [232, 116, 60, 50],
              stroked: false,
              billboard: true,
              pickable: false,
            }),
          ]
        : []),
      new PolygonLayer({
        id: "surface",
        data: WORLD_SURFACE,
        getPolygon: (item: (typeof WORLD_SURFACE)[number]) => item.polygon,
        getFillColor: MAP_OCEAN_RGBA,
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
        getFillColor:
          viewMode === "globe" ? MAP_LAND_GLOBE_RGBA : MAP_LAND_RGBA,
        getLineColor: MAP_LAND_GLOBE_STROKE_RGBA,
        parameters:
          viewMode === "globe"
            ? {
                polygonOffsetFill: true,
                polygonOffset: [0, -2],
              }
            : undefined,
        filled: true,
        stroked: viewMode === "globe",
        lineWidthMinPixels: viewMode === "globe" ? 0.6 : 0,
        pickable: false,
      }),
      new PathLayer<GraticulePath>({
        id: "graticule",
        data: GRATICULE,
        getPath: (item) => item.path,
        getColor:
          viewMode === "map"
            ? MAP_GRATICULE_MAP_RGBA
            : MAP_GRATICULE_GLOBE_RGBA,
        widthMinPixels: 1,
        pickable: false,
      }),
    ],
    [viewMode],
  );

  const quakeGlowLayer = useMemo(() => {
    return new ScatterplotLayer<MapPoint>({
      id: "earthquakes-glow",
      data: visiblePoints,
      getPosition: (p) => p.position,
      getRadius: (p) => {
        const baseRadius =
          viewMode === "map"
            ? getMapBubbleRadius(p, mapZoom, points.length)
            : getGlobeBubbleRadius(p, globeZoom, points.length);
        return baseRadius * 1.1;
      },
      radiusUnits: "pixels",
      radiusMinPixels: 1.5,
      radiusMaxPixels: 45,
      getFillColor: (p): RgbaColor => bubbleGlowColorForMagnitude(p.magnitude),
      stroked: false,
      filled: true,
      opacity: viewMode === "map" ? 0.3 : 0.2,
      parameters: {
        blend: true,
        blendFunc: [0x0302, 0x0001, 0x0302, 0x0001], // GL.SRC_ALPHA, GL.ONE
      },
      pickable: false,
    });
  }, [visiblePoints, viewMode, mapZoom, globeZoom, points.length]);

  const quakeLayer = useMemo(
    () =>
      new ScatterplotLayer<MapPoint>({
        id: "earthquakes",
        data: visiblePoints,
        getPosition: (p) => p.position,
        getRadius: (p) =>
          viewMode === "map"
            ? getMapBubbleRadius(p, mapZoom, points.length)
            : getGlobeBubbleRadius(p, globeZoom, points.length),
        radiusUnits: "pixels",
        radiusMinPixels: 0.8,
        radiusMaxPixels: 35,
        getFillColor: (p) => p.fillColor,
        stroked: true,
        getLineColor: [10, 12, 15, 120],
        getLineWidth: 0.6,
        lineWidthUnits: "pixels",
        filled: true,
        opacity: viewMode === "map" ? 0.85 : 0.7,
        pickable: true,
        autoHighlight: true,
      }),
    [globeZoom, mapZoom, visiblePoints, viewMode, points.length],
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
      <div
        className={`map-shell ${viewMode === "globe" ? "is-globe" : ""}`.trim()}
      >
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
                backgroundColor: "rgba(17, 20, 26, 0.82)",
                borderRadius: "999px",
                "& .MuiToggleButton-root": {
                  color: "var(--ink-1)",
                  borderColor: "var(--line-2)",
                  paddingInline: "0.9rem",
                },
                "& .Mui-selected": {
                  color: "var(--accent) !important",
                  backgroundColor: "rgba(232,116,60,0.16) !important",
                  borderColor: "var(--accent) !important",
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
                onChange={() => setIsAutoRotateEnabled((current) => !current)}
                sx={{
                  color: "var(--ink-1)",
                  borderColor: "var(--line-2)",
                  borderRadius: "999px",
                  backgroundColor: "rgba(17, 20, 26, 0.82)",
                  paddingInline: "0.9rem",
                  "&.Mui-selected": {
                    color: "var(--accent)",
                    backgroundColor: "rgba(232,116,60,0.16)",
                    borderColor: "var(--accent)",
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
            layers={[...baseLayers, quakeGlowLayer, quakeLayer]}
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
          <span>max M{mapData?.maxMagnitude.toFixed(1) ?? "0.0"}</span>
          <span>Orange/red points indicate stronger events</span>
        </div>
      </div>
    </div>
  );
};

export default EarthquakeMap;
