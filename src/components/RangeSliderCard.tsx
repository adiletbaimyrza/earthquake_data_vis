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
  <div id={id} className="card">
    <p className="title">{title}</p>
    <Slider
      sx={{ marginTop: "2rem" }}
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
