/// <reference types="vite/client" />

declare module "plotly.js-dist" {
  const Plotly: {
    newPlot: (
      root: string | HTMLElement,
      data: unknown[],
      layout?: unknown,
      config?: unknown,
    ) => Promise<unknown>;
    react: (
      root: string | HTMLElement,
      data: unknown[],
      layout?: unknown,
      config?: unknown,
    ) => Promise<unknown>;
    setPlotConfig: (config: { mapboxAccessToken?: string }) => void;
    purge: (root: string | HTMLElement) => void;
  };
  export default Plotly;
}
