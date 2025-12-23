"use client"

import { useState } from "react"
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  IconButton,
  Grid,
  TextField,
  InputAdornment,
  Snackbar,
  Alert,
  Stack,
} from "@mui/material"
import {
  Favorite,
  FavoriteBorder,
  Download,
  Visibility,
  Search,
  PictureAsPdf,
  Person,
  School,
} from "@mui/icons-material"

interface FavoriteExam {
  id: string
  title: string
  course: string
  teacher: string
  cycle: string
  uploadDate: string
  savedDate: string
  downloads: number
}

export default function FavoritesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [snackbar, setSnackbar] = useState({ open: false, message: "" })

  const [favorites, setFavorites] = useState<FavoriteExam[]>([
    {
      id: "1",
      title: "Álgebra Lineal - Final 2023",
      course: "Álgebra Lineal",
      teacher: "Dr. Ramírez",
      cycle: "2023-2",
      uploadDate: "2023-11-20",
      savedDate: "2024-01-15",
      downloads: 156,
    },
    {
      id: "2",
      title: "Química Orgánica - Parcial 1",
      course: "Química Orgánica",
      teacher: "Dra. Flores",
      cycle: "2024-1",
      uploadDate: "2024-02-10",
      savedDate: "2024-02-12",
      downloads: 78,
    },
  ])

  const filteredFavorites = favorites.filter(
    (exam) =>
      exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.teacher.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleRemoveFavorite = (id: string) => {
    setFavorites((prev) => prev.filter((e) => e.id !== id))
    setSnackbar({ open: true, message: "Examen eliminado de favoritos" })
  }

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          mb: 4,
          p: 4,
          borderRadius: 3,
          background: "linear-gradient(135deg, #2563eb, #1e40af)",
          color: "white",
        }}
      >
        <Stack direction="row" spacing={3} alignItems="center">
          <Favorite sx={{ fontSize: 48, opacity: 0.9 }} />
          <Box>
            <Typography variant="h4" fontWeight={700}>
              Exámenes Favoritos
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Accede rápidamente a los exámenes que has guardado
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Search */}
      <Card sx={{ mb: 4, borderRadius: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Buscar por curso, docente o título…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              ),
            }}
          />
        </CardContent>
      </Card>

      {/* Empty state */}
      {filteredFavorites.length === 0 ? (
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ py: 8, textAlign: "center" }}>
            <FavoriteBorder sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No hay exámenes favoritos
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Guarda exámenes importantes para verlos aquí
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredFavorites.map((exam) => (
            <Grid size={{xs: 12, md:6, lg:4 }} key={exam.id}>
              <Card
                sx={{
                  height: "100%",
                  borderRadius: 3,
                  transition: "all 0.25s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" mb={2}>
                    <PictureAsPdf color="error" sx={{ fontSize: 42 }} />
                    <IconButton color="error" onClick={() => handleRemoveFavorite(exam.id)}>
                      <Favorite />
                    </IconButton>
                  </Stack>

                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {exam.title}
                  </Typography>

                  <Chip
                    label={exam.cycle}
                    size="small"
                    color="primary"
                    sx={{ mb: 2, fontWeight: 500 }}
                  />

                  <Stack spacing={1}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <School fontSize="small" color="action" />
                      <Typography variant="body2">{exam.course}</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Person fontSize="small" color="action" />
                      <Typography variant="body2">{exam.teacher}</Typography>
                    </Stack>
                  </Stack>

                  <Typography variant="caption" color="text.secondary" mt={2} display="block">
                    Guardado el {new Date(exam.savedDate).toLocaleDateString()}
                  </Typography>
                </CardContent>

                <CardActions sx={{ px: 2, pb: 2 }}>
                  <Button size="small" startIcon={<Visibility />}>
                    Ver
                  </Button>
                  <Button size="small" startIcon={<Download />}>
                    Descargar
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ open: false, message: "" })}
      >
        <Alert severity="success">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  )
}
