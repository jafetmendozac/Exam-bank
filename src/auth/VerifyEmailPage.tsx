import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
  Alert,
} from "@mui/material";
import { reload, sendEmailVerification } from "firebase/auth";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/useAuth";

const VerifyEmailPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    const interval = setInterval(async () => {
      await reload(user);
    }, 3000);

    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (user?.emailVerified) {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  const handleResend = async () => {
    if (!user) return;

    try {
      await sendEmailVerification(user);
      setMessage("Correo de verificación enviado. Revisa tu inbox.");
    } catch {
      setError("No se pudo enviar el correo de verificación.");
    }
  };

  return (
    <Box minHeight="100vh" display="flex" alignItems="center">
      <Container maxWidth="sm">
        <Card sx={{ p: 4 }}>
          <CardContent>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Verifica tu correo
            </Typography>

            <Typography variant="body2" color="text.secondary" mb={2}>
              Hemos enviado un correo de verificación a:
              <br />
              <strong>{user?.email}</strong>
            </Typography>

            {message && <Alert severity="success">{message}</Alert>}
            {error && <Alert severity="error">{error}</Alert>}

            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 3 }}
              onClick={handleResend}
            >
              Reenviar correo de verificación
            </Button>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default VerifyEmailPage;
