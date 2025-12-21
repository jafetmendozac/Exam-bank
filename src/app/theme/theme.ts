// import { createTheme } from "@mui/material/styles"

// export const getTheme = (mode: "light" | "dark") =>
//   createTheme({
//     palette: {
//       mode,
//       primary: {
//         main: "#2563eb", // azul profesional
//       },
//       background: {
//         default: mode === "light" ? "#f8fafc" : "#0f172a",
//         paper: mode === "light" ? "#ffffff" : "#020617",
//       },
//     },
//     shape: {
//       borderRadius: 12,
//     },
//     typography: {
//       fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
//     },
//   })


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
        main: "#16a34a",
      },

      background: {
        default: mode === "light" ? "#f8fafc" : "#020617",
        paper: mode === "light" ? "#ffffff" : "#020617",
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
