import { Chart } from "react-chartjs-2";
import type { ChartConfig } from "../types";

type Props = { config: ChartConfig<"bar"> | null };

const MagSourceBarChart = ({ config }: Props) => (
  <div id="magSource-container" className="card panel chart-panel">
    <p className="panel-kicker">Contributors</p>
    <p className="panel-title">Top Contributors</p>
    {config && (
      <Chart type={config.type} data={config.data} options={config.options} />
    )}
  </div>
);

export default MagSourceBarChart;
