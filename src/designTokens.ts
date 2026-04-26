import type { RgbaColor } from "./types";

export const DESIGN_COLORS = {
  bg0: "#161B22",
  bg1: "#1C2128",
  bg2: "#22272E",
  bg3: "#2D333B",
  ink0: "#E8E2D5",
  ink1: "#B6B0A5",
  ink2: "#7C7770",
  line: "#373E47",
  line2: "#444C56",
  accent: "#E8743C",
  accentWarm: "#F2A03D",
  accentCool: "#5FB3A8",
  danger: "#FF4D2E",
} as const;

export const MAP_OCEAN_RGBA: RgbaColor = [22, 27, 34, 255];
export const MAP_LAND_RGBA: RgbaColor = [45, 51, 59, 255];
export const MAP_LAND_GLOBE_RGBA: RgbaColor = [232, 226, 215, 15];
export const MAP_LAND_GLOBE_STROKE_RGBA: RgbaColor = [232, 226, 215, 46];
export const MAP_GRATICULE_MAP_RGBA: RgbaColor = [45, 51, 64, 72];
export const MAP_GRATICULE_GLOBE_RGBA: RgbaColor = [255, 255, 255, 13];

const bubbleRgb = (magnitude: number): [number, number, number] => {
  if (magnitude >= 7) return [255, 77, 46];
  if (magnitude >= 6) return [232, 116, 60];
  if (magnitude >= 5) return [242, 160, 61];
  if (magnitude >= 4) return [95, 179, 168];
  return [124, 119, 112];
};

export const bubbleColorForMagnitude = (magnitude: number): RgbaColor => {
  const [r, g, b] = bubbleRgb(magnitude);
  return [r, g, b, 217];
};

export const bubbleGlowColorForMagnitude = (magnitude: number): RgbaColor => {
  const [r, g, b] = bubbleRgb(magnitude);
  return [r, g, b, 46];
};
