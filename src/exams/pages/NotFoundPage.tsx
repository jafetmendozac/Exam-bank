import {
  Box,
  Button,
  Container,
  Typography,
  Stack,
  useTheme,
  alpha,
  Paper,
} from "@mui/material"
import { ErrorOutline, Home, ArrowBack } from "@mui/icons-material"
import { useNavigate } from "react-router-dom"

export default function NotFoundPage() {
  const navigate = useNavigate()
  const theme = useTheme()

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: theme.palette.mode === "dark"
          ? alpha(theme.palette.background.default, 0.9)
          : "background.default",
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, md: 6 },
            borderRadius: 4,
            textAlign: "center",
            background:
              theme.palette.mode === "dark"
                ? alpha(theme.palette.background.paper, 0.9)
                : "white",
            boxShadow:
              theme.palette.mode === "dark"
                ? "0 20px 60px rgba(0,0,0,0.4)"
                : "0 20px 60px rgba(0,0,0,0.12)",
          }}
        >
          <Stack spacing={4} alignItems="center">
            {/* ICON */}
            <Box
              sx={{
                width: 110,
                height: 110,
                borderRadius: "50%",
                background: `linear-gradient(135deg,
                  ${alpha(theme.palette.primary.main, 0.15)},
                  ${alpha(theme.palette.secondary.main, 0.15)}
                )`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ErrorOutline
                sx={{
                  fontSize: 70,
                  color: "primary.main",
                }}
              />
            </Box>

            {/* 404 */}
            <Typography
              fontWeight={900}
              sx={{
                fontSize: { xs: "4rem", md: "5.5rem" },
                lineHeight: 1,
                background: `linear-gradient(135deg,
                  ${theme.palette.primary.main},
                  ${theme.palette.secondary.main}
                )`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              404
            </Typography>

            <Typography variant="h4" fontWeight={700}>
              Página no encontrada
            </Typography>

            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ maxWidth: 420 }}
            >
              La página que estás buscando no existe o fue movida.
              Revisa la URL o regresa a una página válida.
            </Typography>

            {/* ACTIONS */}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mt={2}>
              <Button
                variant="contained"
                size="large"
                startIcon={<Home />}
                onClick={() => navigate("/dashboard")}
                sx={{
                  px: 4,
                  py: 1.2,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                Ir al Dashboard
              </Button>

              <Button
                variant="outlined"
                size="large"
                startIcon={<ArrowBack />}
                onClick={() => navigate(-1)}
                sx={{
                  px: 4,
                  py: 1.2,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                Volver
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Container>
    </Box>
  )
}
