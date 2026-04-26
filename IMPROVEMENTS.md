# Earthquake Data Visualization — Improvement Recommendations

## Context

The project is a single-page React + Vite dashboard that visualizes 8,654 USGS earthquake records from a static CSV. It works (map, pie, bar, line, two range sliders, dark theme) but is at a rough-MVP stage: the entire app lives in `src/App.jsx` (228 lines) plus `src/updateLogic.js` (129 lines), there is no error handling, no loading states, the Mapbox token is hardcoded, the layout is a fixed CSS grid that breaks on smaller screens, and one button ("Click me" for abbreviations help) is non-functional. This document is a prioritized menu of improvements to pick from.

## Current State Snapshot

- **Stack**: React 18 + Vite 4 + MUI 5 + Plotly (map) + Chart.js (pie/bar/line) + D3 (CSV load only)
- **Files**: `src/App.jsx`, `src/updateLogic.js`, `src/App.css` (9 lines), `src/index.css`, `src/main.jsx`, `public/usgs-dataset.csv`
- **Data**: Static CSV with pre-computed `bubble_size` and `color` columns (computed offline, not in the app)
- **Filters**: Magnitude range + year range only
- **Visuals**: 1 map, 3 charts, 2 stat cards, 1 broken info card

---

## Tier 1 — Quick wins (a few hours each, high impact)

These are small surgical changes that immediately improve quality and feel.

1. **Move the Mapbox token to `.env`** — `App.jsx:104-105` ships a real token in source. Add `VITE_MAPBOX_TOKEN` to a `.env.local` (gitignored) and read via `import.meta.env`. Rotate the existing token afterwards.
2. **Add loading + error states** — Wrap the `d3.csv()` call (`App.jsx:120`) in `try/catch`, show a centered MUI `<CircularProgress/>` while `dataset === null`, and surface failures with an `<Alert/>` instead of silent blank cards.
3. **Wire the broken "Click me" abbreviations card** — `App.jsx:187-192` currently does nothing. Add an MUI `<Dialog/>` listing magType codes (Md, mww, mwb, etc.) and magSource codes with plain-English meanings.
4. **Map hover tooltips** — Plotly trace currently has no `hovertext`/`hoverinfo`. Add a `text` array with `place + mag + date + depth` so hovering an earthquake shows real info instead of just lat/lon.
5. **Fix line-chart sort order** — `updateLogic.js:78-110` keys by `record.mag` (string), so the x-axis isn't numerically sorted. Sort labels numerically before rendering.
6. **Drop the unused `label: "Custom label for point ${index}"`** at `updateLogic.js:98` — dead code.
7. **Add a `README.md`** — current repo has none. Setup, dev/build/deploy commands, dataset source, screenshot.

## Tier 2 — Foundation (1–2 days, makes everything else easier)

These are structural changes that pay back as the app grows.

8. **Decompose `App.jsx`** — pull each card into its own component under `src/components/` (`MapCard`, `MagnitudePieCard`, `ContributorsBarCard`, `MagnitudeLineCard`, `StatCard`, `RangeSliderCard`, `HelpDialog`). Today everything is one 228-line file.
9. **Extract a `useEarthquakeData` hook** — owns CSV loading, min/max derivation, and filtering by `magRange`/`yearRange`. Replaces the scattered `useRef` + two `useEffect`s in `App.jsx:30-59` and removes the duplicate "initialize then re-update" code path (`initializeAll` at `App.jsx:136` is redundant with the filter effect).
10. **A `constants.ts` (or `.js`) file** — Mapbox center/zoom (`App.jsx:86-91`), color palette, chart aspect ratios (`1.1` and `6.4` are floating around), and grid dimensions all live as magic numbers today.
11. **Optional: TypeScript migration** — only ~360 LOC, so this is a half-day. Earthquake record type, filter state types, chart-data types. Big quality-of-life win for any further work.
12. **Add Vitest + React Testing Library** — unit-test the pure functions in `updateLogic.js` first (easy wins), then a smoke test that the dashboard renders after CSV load.
13. **GitHub Actions CI** — run `npm run lint` + tests on PR; auto-deploy to GitHub Pages on `master` push (replacing the manual `npm run deploy`).

## Tier 3 — New features (pick what excites you)

Concrete additions that change what users can *do* with the app.

14. **Live USGS feed** — replace the static CSV with the public USGS GeoJSON feed (`https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson`). Auto-refresh every N minutes, show "last updated" timestamp. Keep the CSV as a "historical mode" toggle.
15. **Click an earthquake → details drawer** — MUI `<Drawer/>` showing magnitude, depth, place, time, USGS link, nearest city. Today the map is read-only.
16. **Depth filter** — third range slider. Depth is already in the dataset but unused.
17. **Date/time granularity** — the year slider is too coarse. Replace with a date-range picker (MUI `DateRangePicker`) so users can scope to weeks/months.
18. **Search by place** — text input that filters records by `place` substring (e.g., "Japan", "California").
19. **Bookmarkable state via URL params** — sync `magRange`/`yearRange`/`search` to the query string so users can share specific views.
20. **Export filtered data** — buttons to download current filtered set as CSV or JSON, and chart panels as PNG (Chart.js supports `toBase64Image()`).
21. **Timeline animation** — a play button that animates the year slider forward, showing earthquakes appearing on the map over time.
22. **Comparison mode** — side-by-side maps comparing two time periods or magnitude bands.
23. **Statistical highlights card** — auto-surface "largest in selection", "deepest", "most active region", "year with most events".

## Tier 4 — Visual / UX upgrades

24. **Mobile responsiveness** — `App.css` is `repeat(42, 1fr) × repeat(20, 1fr)` fixed grid that breaks below ~1200px. Switch to a CSS Grid layout with media queries that stacks panels on tablets/phones.
25. **Modern map renderer** — swap Plotly's scattermapbox for **deck.gl** (`HexagonLayer` or `ScatterplotLayer`). Massively better performance, real clustering, and the option of a 3D extruded view where bar height = earthquake count per hex.
26. **3D globe view toggle** — `globe.gl` (built on three.js) gives a rotating Earth with earthquake bubbles. Visually striking and great for a portfolio piece.
27. **Tectonic plate boundary overlay** — public GeoJSON (e.g., from `fraxen/tectonicplates`). Helps explain *why* earthquakes cluster where they do.
28. **Light/dark theme toggle** — MUI already supports `createTheme`; small effort.
29. **Color palette accessibility** — current orange (`#ff8000`) on dark `#191a1a` is fine, but the magnitude-color scale (pre-computed in CSV) isn't documented or accessible. Define it with `d3-scale-chromatic` (`interpolateInferno` or `interpolateViridis`) at runtime instead of in the CSV — that also lets users swap palettes.
30. **Skeleton loaders** — MUI `<Skeleton/>` placeholders for each card during CSV load instead of empty cards.
31. **Subtle animations** — Framer Motion for card mount/filter transitions; the dashboard currently feels static.

---

## Suggested ordering (if you want one)

If you want a single recommended path rather than a menu: **Tier 1 in full → items 8, 9, 12 from Tier 2 → item 14 (live feed) → item 25 (deck.gl map) → item 26 (3D globe toggle)**. That sequence gets you from "rough MVP" to "polished portfolio piece with live data and a wow factor" without a full rewrite.

## Critical files referenced

- `src/App.jsx` — 228-line monolith, all UI + state + Plotly setup
- `src/updateLogic.js` — pure data-aggregation functions (good candidates for unit tests as-is)
- `src/App.css` — 9-line fixed CSS grid (the responsive bottleneck)
- `package.json` — `plotly.js-dist`, `chart.js`, `d3`, `@mui/material` already present
- `public/usgs-dataset.csv` — static dataset with pre-computed `bubble_size` and `color`
