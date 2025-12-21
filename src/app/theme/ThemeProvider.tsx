import { useMemo, useState } from "react"
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import { useMediaQuery } from "@mui/material"
import { ColorModeContext } from "./ColorModeContext"
import { getTheme } from "./theme"
import { useAuth } from "@/auth/context/useAuth"

// export function ThemeProvider({ children }: { children: React.ReactNode }) {
//   const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)")
//   const { role } = useAuth()

//   const [mode, setMode] = useState<"light" | "dark">(() => {
//     const saved = localStorage.getItem("color-mode")
//     if (saved === "light" || saved === "dark") {
//       return saved
//     }
//     return prefersDarkMode ? "dark" : "light"
//   })

//   const toggleColorMode = () => {
//     setMode((prev) => {
//       const next = prev === "light" ? "dark" : "light"
//       localStorage.setItem("color-mode", next)
//       return next
//     })
//   }

//   const theme = useMemo(() => getTheme(mode, role), [mode, role])

//   return (
//     <ColorModeContext.Provider value={{ mode, toggleColorMode }}>
//       <MuiThemeProvider theme={theme}>
//         <CssBaseline />
//         {children}
//       </MuiThemeProvider>
//     </ColorModeContext.Provider>
//   )
// }

type UserRole = "admin" | "alumno"


export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)")
  const { role } = useAuth()

  const [mode, setMode] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("color-mode")
    return saved === "dark" || saved === "light"
      ? saved
      : prefersDarkMode
      ? "dark"
      : "light"
  })

  const resolvedRole: UserRole = role === "admin" ? "admin" : "alumno"

  const toggleColorMode = () => {
    setMode((prev) => {
      const next = prev === "light" ? "dark" : "light"
      localStorage.setItem("color-mode", next)
      return next
    })
  }
  console.log("APPLYING THEME FOR:", resolvedRole)


  const theme = useMemo(() => {
    return getTheme(mode, resolvedRole)
  }, [mode, resolvedRole])

  return (
    <ColorModeContext.Provider value={{ mode, toggleColorMode }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ColorModeContext.Provider>
  )
}
