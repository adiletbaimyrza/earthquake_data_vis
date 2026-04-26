import { Chart } from "react-chartjs-2";
import type { ChartConfig } from "../types";

type Props = { config: ChartConfig<"line"> | null };

const MagLineChart = ({ config }: Props) => (
  <div id="mag-linechart-container" className="card">
    {config && (
      <Chart type={config.type} data={config.data} options={config.options} />
    )}
  </div>
);

export default MagLineChart;
