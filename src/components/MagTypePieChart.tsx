import { Chart } from "react-chartjs-2";
import type { ChartConfig } from "../types";

type Props = { config: ChartConfig<"pie"> | null };

const MagTypePieChart = ({ config }: Props) => (
  <div id="magType-container" className="card">
    <p className="title">Magnitude Type Distribution</p>
    {config && (
      <Chart type={config.type} data={config.data} options={config.options} />
    )}
  </div>
);

export default MagTypePieChart;
