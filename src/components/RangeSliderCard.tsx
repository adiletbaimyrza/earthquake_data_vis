import { Slider } from "@mui/material";
import type { Range } from "../types";

type RangeSliderCardProps = {
  id: string;
  title: string;
  min: number;
  max: number;
  step: number;
  value: Range;
  onChange: (next: Range) => void;
};

const RangeSliderCard = ({
  id,
  title,
  min,
  max,
  step,
  value,
  onChange,
}: RangeSliderCardProps) => (
  <div id={id} className="card panel slider-card">
    <p className="panel-kicker">Range Filter</p>
    <p className="panel-title">{title}</p>
    <div className="slider-meta">
      <span>{min.toFixed(step < 1 ? 1 : 0)}</span>
      <span>{max.toFixed(step < 1 ? 1 : 0)}</span>
    </div>
    <Slider
      sx={{
        marginTop: "1.5rem",
        color: "var(--accent)",
        "& .MuiSlider-rail": {
          backgroundColor: "var(--line-2)",
          opacity: 1,
          height: 2,
        },
        "& .MuiSlider-track": {
          height: 2,
          border: "none",
          background:
            "linear-gradient(90deg, var(--accent) 0%, var(--accent-warm) 100%)",
        },
        "& .MuiSlider-thumb": {
          width: 14,
          height: 14,
          backgroundColor: "var(--bg-2)",
          border: "1.5px solid var(--accent)",
          boxShadow: "0 0 0 4px rgba(232, 116, 60, 0.15)",
        },
        "& .MuiSlider-valueLabel": {
          fontFamily: '"JetBrains Mono", monospace',
          backgroundColor: "var(--bg-3)",
          border: "1px solid var(--line-2)",
        },
      }}
      valueLabelDisplay="auto"
      min={min}
      max={max}
      step={step}
      defaultValue={value}
      onChange={(_, next) => onChange(next as Range)}
    />
  </div>
);

export default RangeSliderCard;
