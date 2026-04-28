import type { MapPoint } from "../types";
import { DESIGN_COLORS } from "../designTokens";

type Props = {
  point: MapPoint | null;
  onClose: () => void;
};

const magHex = (magnitude: number): string => {
  if (magnitude >= 7) return DESIGN_COLORS.danger;
  if (magnitude >= 6) return DESIGN_COLORS.accent;
  if (magnitude >= 5) return DESIGN_COLORS.accentWarm;
  return DESIGN_COLORS.accentCool;
};

const fmtTime = (iso: string): string =>
  new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });

const EarthquakeDetailDrawer = ({ point, onClose }: Props) => (
  <div className={`eq-drawer ${point ? "is-open" : ""}`.trim()}>
    <button className="eq-drawer-close" onClick={onClose} aria-label="Close">
      ✕
    </button>
    {point && (
      <>
        <p className="eq-drawer-eyebrow">Earthquake detail</p>
        <p className="eq-drawer-place">{point.place || "Unknown location"}</p>

        <div
          className="eq-drawer-mag"
          style={{ color: magHex(point.magnitude) }}
        >
          <span className="eq-drawer-mag-label">M</span>
          {point.magnitude.toFixed(1)}
        </div>

        <div className="eq-drawer-rows">
          <div className="eq-drawer-row">
            <span>Depth</span>
            <span>{point.depth.toFixed(1)} km</span>
          </div>
          <div className="eq-drawer-row">
            <span>Origin time</span>
            <span>{fmtTime(point.time)}</span>
          </div>
          <div className="eq-drawer-row">
            <span>Mag type</span>
            <span>{point.magType || "—"}</span>
          </div>
          <div className="eq-drawer-row">
            <span>Network</span>
            <span>{point.magSource || "—"}</span>
          </div>
        </div>

        <a
          className="eq-drawer-link"
          href={`https://earthquake.usgs.gov/earthquakes/eventpage/${point.id}`}
          target="_blank"
          rel="noreferrer"
        >
          View on USGS →
        </a>
      </>
    )}
  </div>
);

export default EarthquakeDetailDrawer;
