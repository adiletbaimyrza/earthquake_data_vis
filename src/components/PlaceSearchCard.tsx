import { TextField } from "@mui/material";

type Props = {
  value: string;
  onChange: (next: string) => void;
};

const PlaceSearchCard = ({ value, onChange }: Props) => (
  <div id="place-search-container" className="card panel">
    <p className="panel-kicker">Filter</p>
    <p className="panel-title">Search by Place</p>
    <TextField
      placeholder='e.g. "Japan", "California"'
      size="small"
      fullWidth
      value={value}
      onChange={(e) => onChange(e.target.value)}
      inputProps={{ "aria-label": "Search by place" }}
      sx={{
        mt: 1,
        "& .MuiOutlinedInput-root": {
          color: "var(--ink-0)",
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: "0.8rem",
          backgroundColor: "var(--bg-2)",
        },
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: "var(--line-2)",
        },
        "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
          borderColor: "var(--ink-2)",
        },
        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
          {
            borderColor: "var(--accent)",
          },
        "& input::placeholder": {
          color: "var(--ink-2)",
          opacity: 1,
        },
      }}
    />
    {value && (
      <button
        className="place-search-clear"
        onClick={() => onChange("")}
        aria-label="Clear search"
      >
        Clear
      </button>
    )}
  </div>
);

export default PlaceSearchCard;
