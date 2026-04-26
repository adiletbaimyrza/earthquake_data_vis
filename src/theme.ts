import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#E8743C" },
    secondary: { main: "#5FB3A8" },
    error: { main: "#FF4D2E" },
    warning: { main: "#F2A03D" },
    success: { main: "#5FB3A8" },
    background: {
      default: "#161B22",
      paper: "#1C2128",
    },
    text: {
      primary: "#E8E2D5",
      secondary: "#B6B0A5",
    },
    divider: "#373E47",
  },
  shape: {
    borderRadius: 4,
  },
  typography: {
    fontFamily: '"Inter", system-ui, sans-serif',
    button: {
      fontWeight: 600,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      fontSize: "0.72rem",
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFeatureSettings: '"tnum" 1',
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        },
      },
    },
  },
});

export default theme;
