import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  TextField,
  Typography,
  CircularProgress,
  Divider,
  Alert,
} from "@mui/material";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import GoogleIcon from "@mui/icons-material/Google";
import { useState } from "react";

import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import type { UserCredential } from "firebase/auth"

import { auth } from "../app/firebase";
import { isUnitruEmail } from "../shared/utils/isUnitruEmail";

const Login = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!isUnitruEmail(email)) {
      setError("Solo se permiten correos @unitru.edu.pe");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch {
      setError("Correo o contraseña incorrectos");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const result: UserCredential = await signInWithPopup(auth, provider);

      const userEmail = result.user.email;

      if (!userEmail || !isUnitruEmail(userEmail)) {
        await result.user.delete();
        setError("Solo se permiten correos @unitru.edu.pe");
      }
    } catch {
      setError("Error al iniciar sesión con Google");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Container maxWidth="sm">
        <Card sx={{ p: 4, borderRadius: 3 }}>
          <CardContent>
            <Box textAlign="center" mb={4}>
              <MenuBookIcon color="primary" sx={{ fontSize: 48 }} />
              <Typography variant="h5" fontWeight="bold">
                Iniciar Sesión
              </Typography>
            </Box>

            {error && <Alert severity="error">{error}</Alert>}

            <Box component="form" onSubmit={handleLogin}>
              <TextField
                fullWidth
                label="Correo institucional"
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <TextField
                fullWidth
                label="Contraseña"
                type="password"
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                sx={{ mt: 3 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : "Iniciar sesión"}
              </Button>
            </Box>

            <Divider sx={{ my: 3 }}>o</Divider>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              Iniciar sesión con Google
            </Button>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Login;
