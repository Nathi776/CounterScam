import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#060B16",
      paper: "#0B1220",
    },
    primary: { main: "#7C3AED" },
    secondary: { main: "#06B6D4" },
    success: { main: "#22C55E" },
    warning: { main: "#F59E0B" },
    error: { main: "#EF4444" },
    divider: "rgba(255,255,255,0.08)",
  },
  typography: {
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji"',
    h4: { fontWeight: 800, letterSpacing: -0.5 },
    h6: { fontWeight: 800 },
    body2: { opacity: 0.85 },
  },
  shape: { borderRadius: 16 },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          border: "1px solid rgba(255,255,255,0.08)",
          backgroundImage: "none",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: { fontWeight: 800, opacity: 0.75 },
        root: { borderBottom: "1px solid rgba(255,255,255,0.08)" },
      },
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <App />
  </ThemeProvider>
);