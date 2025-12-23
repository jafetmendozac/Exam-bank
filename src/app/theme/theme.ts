import { createTheme } from "@mui/material/styles"

export const getTheme = (
  mode: "light" | "dark",
  role: "admin" | "alumno" | null
) =>
  createTheme({
    palette: {
      mode,

      primary: {
        main: role === "admin" ? "#ea580c" : "#2563eb",
      },

      secondary: {
        main: role === "admin" ? "#f97316" : "#10b981",
      },

      background: {
        default: mode === "dark" ? "#020617" : "#f8fafc",
        paper: mode === "dark" ? "#020617" : "#ffffff",
      },

      text: {
        primary: mode === "dark" ? "#e5e7eb" : "#020617",
        secondary: mode === "dark" ? "#94a3b8" : "#475569",
      },
    },

    typography: {
      fontFamily: "Inter, system-ui, sans-serif",
      h1: { fontWeight: 700 },
      h2: { fontWeight: 600 },
      button: { textTransform: "none", fontWeight: 600 },
    },

    shape: {
      borderRadius: 12,
    },
  })
