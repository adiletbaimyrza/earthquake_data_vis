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

const getStatusTone = (
  isLoading: boolean,
  error: Error | null,
  lastUpdated: Date | null,
): string => {
  if (error) return "is-danger";
  if (isLoading) return "is-warm";
  if (lastUpdated) return "is-cool";
  return "";
};

const sameQuery = (a: HistoricalQuery, b: HistoricalQuery): boolean =>
  a.startYear === b.startYear &&
  a.endYear === b.endYear &&
  a.minMagnitude === b.minMagnitude;

const inputSx = {
  width: 96,
  "& .MuiOutlinedInput-root": {
    color: "var(--ink-0)",
    fontFamily: '"JetBrains Mono", monospace',
    backgroundColor: "var(--bg-2)",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "var(--line-2)",
  },
  "& .MuiInputLabel-root": {
    color: "var(--ink-2)",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    fontSize: "0.72rem",
  },
};

const selectSx = {
  width: 106,
  color: "var(--ink-0)",
  fontFamily: '"JetBrains Mono", monospace',
  backgroundColor: "var(--bg-2)",
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "var(--line-2)",
  },
  "& .MuiSvgIcon-root": { color: "var(--ink-1)" },
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
    <div id="info" className="card panel data-source-card">
      <div className="panel-header">
        <div>
          <p className="panel-kicker">Data Source</p>
          <p className="panel-title">Acquisition Window</p>
        </div>
        <div
          className={`data-source-status-pill ${getStatusTone(
            isLoading,
            error,
            lastUpdated,
          )}`}
        >
          <span className="status-dot" />
          <span className="data-source-status">
            {formatStatus(isLoading, error, lastUpdated) || "Idle"}
          </span>
        </div>
      </div>
      <div className="data-source-row">
        <ToggleButtonGroup
          value={source}
          exclusive
          size="small"
          onChange={(_, next: DataSource | null) => {
            if (next) onSourceChange(next);
          }}
          sx={{
            backgroundColor: "var(--bg-2)",
            borderRadius: "999px",
            "& .MuiToggleButton-root": {
              color: "var(--ink-1)",
              borderColor: "var(--line-2)",
              paddingInline: "1rem",
            },
            "& .Mui-selected": {
              color: "var(--accent) !important",
              borderColor: "var(--accent) !important",
              backgroundColor: "rgba(232, 116, 60, 0.12) !important",
            },
          }}
        >
          <ToggleButton value="historical">Historical</ToggleButton>
          <ToggleButton value="live">Live (USGS)</ToggleButton>
        </ToggleButtonGroup>
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
              color: "var(--accent)",
              borderColor: "var(--accent)",
              backgroundColor: "rgba(232, 116, 60, 0.08)",
              "&.Mui-disabled": {
                color: "rgba(232,116,60,0.35)",
                borderColor: "rgba(232,116,60,0.18)",
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
