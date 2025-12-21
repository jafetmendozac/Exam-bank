import { createContext, useContext } from "react"

export type ColorMode = "light" | "dark"

interface ColorModeContextType {
  mode: ColorMode
  toggleColorMode: () => void
}

export const ColorModeContext = createContext<ColorModeContextType>({
  mode: "light",
  toggleColorMode: () => {},
})

export const useColorMode = () => useContext(ColorModeContext)
