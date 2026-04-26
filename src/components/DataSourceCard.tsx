import { useEffect, useState } from "react";
import {
  Button,
  MenuItem,
  Select,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import type { DataSource } from "../dataSources";
import {
  HISTORICAL_MAGNITUDE_OPTIONS,
  HISTORICAL_MIN_YEAR,
  type HistoricalQuery,
} from "../types";

type Props = {
  source: DataSource;
  onSourceChange: (next: DataSource) => void;
  historicalQuery: HistoricalQuery;
  onHistoricalQueryChange: (next: HistoricalQuery) => void;
  lastUpdated: Date | null;
  isLoading: boolean;
  error: Error | null;
};

const formatStatus = (
  isLoading: boolean,
  error: Error | null,
  lastUpdated: Date | null,
): string => {
  if (isLoading) return "Loading…";
  if (error) return `Error: ${error.message}`;
  if (lastUpdated) return `Last updated ${lastUpdated.toLocaleTimeString()}`;
  return "";
};

const sameQuery = (a: HistoricalQuery, b: HistoricalQuery): boolean =>
  a.startYear === b.startYear &&
  a.endYear === b.endYear &&
  a.minMagnitude === b.minMagnitude;

const inputSx = {
  width: 90,
  "& .MuiOutlinedInput-root": { color: "white" },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(255,255,255,0.3)",
  },
  "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.6)" },
};

const selectSx = {
  width: 90,
  color: "white",
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(255,255,255,0.3)",
  },
  "& .MuiSvgIcon-root": { color: "white" },
};

const DataSourceCard = ({
  source,
  onSourceChange,
  historicalQuery,
  onHistoricalQueryChange,
  lastUpdated,
  isLoading,
  error,
}: Props) => {
  const currentYear = new Date().getUTCFullYear();
  const [draft, setDraft] = useState<HistoricalQuery>(historicalQuery);

  useEffect(() => {
    setDraft(historicalQuery);
  }, [historicalQuery]);

  const clampYear = (value: number): number =>
    Math.max(HISTORICAL_MIN_YEAR, Math.min(currentYear, value));

  const onLoad = () => {
    const lo = Math.min(draft.startYear, draft.endYear);
    const hi = Math.max(draft.startYear, draft.endYear);
    onHistoricalQueryChange({
      startYear: clampYear(lo),
      endYear: clampYear(hi),
      minMagnitude: draft.minMagnitude,
    });
  };

  const loadDisabled = isLoading || sameQuery(draft, historicalQuery);

  return (
    <div id="info" className="card data-source-card">
      <div className="data-source-row">
        <ToggleButtonGroup
          value={source}
          exclusive
          size="small"
          onChange={(_, next: DataSource | null) => {
            if (next) onSourceChange(next);
          }}
          sx={{
            "& .MuiToggleButton-root": {
              color: "white",
              borderColor: "rgba(255,255,255,0.3)",
            },
            "& .Mui-selected": {
              color: "#ff8000 !important",
              borderColor: "#ff8000 !important",
            },
          }}
        >
          <ToggleButton value="historical">Historical</ToggleButton>
          <ToggleButton value="live">Live (USGS)</ToggleButton>
        </ToggleButtonGroup>
        <span className="data-source-status">
          {formatStatus(isLoading, error, lastUpdated)}
        </span>
      </div>

      {source === "historical" && (
        <div className="data-source-row">
          <TextField
            label="From"
            type="number"
            size="small"
            value={draft.startYear}
            onChange={(e) =>
              setDraft({ ...draft, startYear: Number(e.target.value) })
            }
            inputProps={{ min: HISTORICAL_MIN_YEAR, max: currentYear }}
            sx={inputSx}
          />
          <TextField
            label="To"
            type="number"
            size="small"
            value={draft.endYear}
            onChange={(e) =>
              setDraft({ ...draft, endYear: Number(e.target.value) })
            }
            inputProps={{ min: HISTORICAL_MIN_YEAR, max: currentYear }}
            sx={inputSx}
          />
          <Select
            size="small"
            value={draft.minMagnitude}
            onChange={(e) =>
              setDraft({ ...draft, minMagnitude: Number(e.target.value) })
            }
            sx={selectSx}
          >
            {HISTORICAL_MAGNITUDE_OPTIONS.map((m) => (
              <MenuItem key={m} value={m}>
                M{m.toFixed(1)}+
              </MenuItem>
            ))}
          </Select>
          <Button
            variant="outlined"
            size="small"
            onClick={onLoad}
            disabled={loadDisabled}
            sx={{
              color: "#ff8000",
              borderColor: "#ff8000",
              "&.Mui-disabled": {
                color: "rgba(255,128,0,0.4)",
                borderColor: "rgba(255,128,0,0.2)",
              },
            }}
          >
            Load
          </Button>
        </div>
      )}
    </div>
  );
};

export default DataSourceCard;
