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
import { useNavigate } from "react-router-dom";

import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendEmailVerification
} from "firebase/auth";
import type { UserCredential } from "firebase/auth"
import { Link as RouterLink } from "react-router-dom";

import { isUnitruEmail } from "../shared/utils/isUnitruEmail";
import { auth } from "../app/firebase";


const Register = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!isUnitruEmail(email)) {
      setError("Solo se permiten correos @unitru.edu.pe");
      return;
    }

    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await sendEmailVerification(cred.user);

      alert(
        "Te enviamos un correo de verificación. Revisa tu correo institucional."
      );
      navigate("/verify-email");
    
    } catch {
      setError("Error al crear la cuenta");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setError("");
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const result: UserCredential = await signInWithPopup(auth, provider);

      const userEmail = result.user.email;

      if (!userEmail || !isUnitruEmail(userEmail)) {
        await result.user.delete();
        setError("Solo se permiten correos @unitru.edu.pe");
        return;
      }
      navigate('/login');

    } catch {
      setError("Error al registrarse con Google");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minHeight="100vh" display="flex" alignItems="center">
      <Container maxWidth="sm">
        <Card sx={{ p: 4 }}>
          <CardContent>
            <Box textAlign="center" mb={4}>
              <MenuBookIcon color="primary" sx={{ fontSize: 48 }} />
              <Typography variant="h5" fontWeight="bold">
                Crear Cuenta
              </Typography>
            </Box>

            {error && <Alert severity="error">{error}</Alert>}

            <Box component="form" onSubmit={handleRegister}>
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
                {loading ? <CircularProgress size={24} /> : "Registrarse"}
              </Button>
            </Box>

            <Divider sx={{ my: 3 }}>o</Divider>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleRegister}
              disabled={loading}
            >
              Registrarse con Google
            </Button>

            <Box textAlign="center" mt={2}>
              <RouterLink to="/login" style={{ textDecoration: 'none', color: 'inherit' }}>
                <Typography variant="body2" color="primary">
                  Ya te registraste ? Inicia Sesión ahora
                </Typography>
              </RouterLink>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Register;
