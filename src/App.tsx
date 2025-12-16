import { onAuthStateChanged } from "firebase/auth";
import { auth } from './app/firebase';
import { Button, Typography, Box } from '@mui/material'
import { useEffect, useState } from "react";
import Login from './auth/LoginPage';
import Register from "./auth/RegisterPage";


function App() {

  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsub();
  }, []);

  if (!user) return <Login />;

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
