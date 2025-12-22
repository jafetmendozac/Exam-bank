import {
  Box,
  Button,
  Container,
  Typography,
  Card,
  CardContent,
  Stack,
  useTheme,
  alpha,
  Chip,
  Grid
} from "@mui/material"
import {
  School,
  CloudUpload,
  Search,
  Verified,
  Group,
  TrendingUp,
  AutoStories,
  Speed,
  Security,
} from "@mui/icons-material"
import { useNavigate } from "react-router-dom"

export default function LandingPage() {
  const navigate = useNavigate()
  const theme = useTheme()

  const features = [
    {
      icon: <Search sx={{ fontSize: 40 }} />,
      title: "Busca Exámenes",
      description:
        "Encuentra exámenes por curso, profesor o ciclo académico.",
    },
    {
      icon: <CloudUpload sx={{ fontSize: 40 }} />,
      title: "Comparte Conocimiento",
      description:
        "Sube tus exámenes y ayuda a otros estudiantes.",
    },
    {
      icon: <Verified sx={{ fontSize: 40 }} />,
      title: "Contenido Verificado",
      description:
        "Revisión comunitaria para asegurar calidad.",
    },
    {
      icon: <Speed sx={{ fontSize: 40 }} />,
      title: "Acceso Rápido",
      description:
        "Descargas inmediatas sin complicaciones.",
    },
    {
      icon: <AutoStories sx={{ fontSize: 40 }} />,
      title: "Organizado",
      description:
        "Clasificado por cursos, ciclos y profesores.",
    },
    {
      icon: <Security sx={{ fontSize: 40 }} />,
      title: "Seguro",
      description:
        "Solo contenido académico permitido.",
    },
  ]

  const stats = [
    { number: "5000+", label: "Exámenes" },
    { number: "1200+", label: "Estudiantes" },
    { number: "150+", label: "Cursos" },
    { number: "25K+", label: "Descargas" },
  ]

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      {/* HERO */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          color: "white",
          py: { xs: 8, md: 12 },
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid size={{ xs: 12, md: 7 }}>
              <Stack spacing={3}>
                <Box display="flex" alignItems="center" gap={1}>
                  <School />
                  <Typography fontWeight={700}>ExamBank</Typography>
                  <Chip
                    label="Beta"
                    size="small"
                    sx={{ bgcolor: alpha("#fff", 0.2), color: "white" }}
                  />
                </Box>

                <Typography
                  variant="h2"
                  fontWeight={800}
                  sx={{ fontSize: { xs: "2.5rem", md: "3.5rem" } }}
                >
                  Banco de Exámenes
                  <br />
                  Hecho por Estudiantes
                </Typography>

                <Typography sx={{ maxWidth: 550, opacity: 0.95 }}>
                  Plataforma colaborativa para acceder y compartir exámenes
                  reales de ciclos anteriores.
                </Typography>

                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate("/login")}
                    sx={{
                      bgcolor: "white",
                      color: "primary.main",
                      fontWeight: 600,
                    }}
                  >
                    Iniciar Sesión
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate("/register")}
                    sx={{ borderColor: "white", color: "white" }}
                  >
                    Registrarse
                  </Button>
                </Stack>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <Box
                sx={{
                  height: 320,
                  bgcolor: alpha("#fff", 0.12),
                  borderRadius: 4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Group sx={{ fontSize: 140, opacity: 0.7 }} />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* STATS */}
      <Container maxWidth="lg" sx={{ mt: -4, mb: 8 }}>
        <Grid container spacing={3}>
          {stats.map((s, i) => (
            <Grid key={i} size={{ xs: 6, sm: 3 }}>
              <Card sx={{ textAlign: "center", py: 3 }}>
                <CardContent>
                  <Typography variant="h4" fontWeight={800} color="primary">
                    {s.number}
                  </Typography>
                  <Typography color="text.secondary">
                    {s.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* FEATURES */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={3}>
          {features.map((f, i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card sx={{ height: "100%", textAlign: "center", p: 3 }}>
                <CardContent>
                  <Box
                    sx={{
                      width: 72,
                      height: 72,
                      mx: "auto",
                      mb: 2,
                      borderRadius: "50%",
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: "primary.main",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {f.icon}
                  </Box>
                  <Typography fontWeight={600}>{f.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {f.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA */}
      <Box sx={{ py: 8, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
        <Container maxWidth="md">
          <Stack spacing={3} alignItems="center" textAlign="center">
            <TrendingUp color="primary" sx={{ fontSize: 48 }} />
            <Typography variant="h4" fontWeight={700}>
              Únete a la Comunidad
            </Typography>
            <Typography color="text.secondary">
              Miles de estudiantes ya usan ExamBank para prepararse mejor.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/register")}
            >
              Comenzar ahora
            </Button>
          </Stack>
        </Container>
      </Box>
    </Box>
  )
}
