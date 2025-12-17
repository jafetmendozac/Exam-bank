import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider, CssBaseline, createTheme } from '@mui/material'
import { RouterProvider } from 'react-router-dom'
import { router } from './app/router.tsx'
import { Providers } from './app/providers.tsx'


const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Providers>
        <RouterProvider router={router} />
      </Providers>
    </ThemeProvider>
  </StrictMode>
)
