import { Button, Typography, Box } from '@mui/material'

function App() {


  return (
    <>
      <Box sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          MUI está funcionando 🎉
        </Typography>

        <Button variant="contained">
          Botón MUI
        </Button>
      </Box>
    </>
  )
}

export default App
