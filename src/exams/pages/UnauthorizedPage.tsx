import { Box, Button, Container, Typography, Stack, useTheme, alpha } from "@mui/material"
import { Lock, ArrowBack } from "@mui/icons-material"
import { useNavigate } from "react-router-dom"

export default function UnauthorizedPage() {
  const navigate = useNavigate()
  const theme = useTheme()

  return (
    <Box maxWidth="lg" sx={{ py: 4 }}>
      <Container maxWidth="sm">
        <Stack spacing={4} alignItems="center" textAlign="center">

          <Box
            sx={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              bgcolor: alpha(theme.palette.warning.main, 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Lock sx={{ fontSize: 80, color: "warning.main" }} />
          </Box>

          <Typography
            variant="h1"
            fontWeight={800}
            color="warning.main"
            sx={{ fontSize: { xs: "4rem", md: "6rem" } }}
          >
            403
          </Typography>

          <Typography variant="h4" fontWeight={600}>
            Acceso Denegado
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 450 }}>
            No tienes permiso para acceder a esta página. Si crees que esto es un error, contacta al administrador o
            verifica tus credenciales.
          </Typography>

          <Box
            sx={{
              width: "100%",
              p: 3,
              bgcolor: alpha(theme.palette.warning.main, 0.05),
              borderRadius: 2,
              border: "1px solid",
              borderColor: alpha(theme.palette.warning.main, 0.2),
            }}
          >
            <Typography variant="body2" fontWeight={600} gutterBottom>
              Posibles razones:
            </Typography>
            <Typography component="ul" variant="body2" color="text.secondary" sx={{ textAlign: "left", pl: 2 }}>
              <li>Tu cuenta no tiene los permisos necesarios</li>
              <li>La página es exclusiva para administradores</li>
            </Typography>
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Button
              variant="outlined"
              size="large"
              startIcon={<ArrowBack />}
              onClick={() => navigate(-1)}
              sx={{ px: 4 }}
            >
              Volver Atrás
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  )
}
