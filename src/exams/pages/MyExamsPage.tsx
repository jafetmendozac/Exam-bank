"use client"

import { useState, useEffect } from "react"
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material"
import {
  CloudUpload,
  Delete,
  Edit,
  Visibility,
  Download,
  Search,
  PictureAsPdf,
  Person,
  School,
  CalendarToday,
} from "@mui/icons-material"
import { useAuth } from "@/auth/context/useAuth"
import { getUserExams, deleteExam, getExamDownloadURL } from "../services/exams.service"

interface MyExam {
  id: string
  title: string
  course: string
  teacher: string
  cycle: string
  unit: string
  section: string
  uploadDate: Date | string
  status: "pending" | "approved" | "rejected"
  downloads: number
  fileUrl: string
  fileName: string
  filePath: string
}

export default function MyExamsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" | "info" | "warning" })
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; examId: string | null; filePath: string | null }>({
    open: false,
    examId: null,
    filePath: null,
  })

  const [myExams, setMyExams] = useState<MyExam[]>([])

  // Cargar exámenes desde Firestore
  useEffect(() => {
    const loadExams = async () => {
      if (!user?.uid) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const exams = await getUserExams(user.uid)
        setMyExams(exams)
      } catch (error) {
        setSnackbar({
          open: true,
          message: "Error al cargar los exámenes",
          severity: "error",
        })
      } finally {
        setLoading(false)
      }
    }

    loadExams()
  }, [user])

  const filteredExams = myExams.filter(
    (exam) =>
      exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.teacher.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "success"
      case "pending":
        return "warning"
      case "rejected":
        return "error"
      default:
        return "default"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "approved":
        return "Aprobado"
      case "pending":
        return "Pendiente"
      case "rejected":
        return "Rechazado"
      default:
        return status
    }
  }

  const handleDelete = async () => {
    if (deleteDialog.examId && deleteDialog.filePath) {
      try {
        await deleteExam(deleteDialog.examId, deleteDialog.filePath)
        setMyExams((prev) => prev.filter((e) => e.id !== deleteDialog.examId))
        setSnackbar({ open: true, message: "Examen eliminado correctamente", severity: "success" })
      } catch (error) {
        setSnackbar({
          open: true,
          message: "Error al eliminar el examen",
          severity: "error",
        })
      } finally {
        setDeleteDialog({ open: false, examId: null, filePath: null })
      }
    }
  }

  const handleView = async (filePath: string) => {
    try {
      // Regenerar URL de descarga para asegurar token válido
      const fileUrl = await getExamDownloadURL(filePath)
      window.open(fileUrl, "_blank")
    } catch (error) {
      console.error("Error al obtener URL del archivo:", error)
      setSnackbar({
        open: true,
        message: "Error al abrir el archivo. Verifica que estés autenticado.",
        severity: "error",
      })
    }
  }

  const handleDownload = async (filePath: string, fileName: string) => {
    try {
      // Regenerar URL de descarga para asegurar token válido
      const fileUrl = await getExamDownloadURL(filePath)
      const link = document.createElement("a")
      link.href = fileUrl
      link.download = fileName
      link.target = "_blank"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Error al descargar el archivo:", error)
      setSnackbar({
        open: true,
        message: "Error al descargar el archivo. Verifica que estés autenticado.",
        severity: "error",
      })
    }
  }

  const handleEdit = (_id: string) => {
    // TODO: Implementar edición
    setSnackbar({ open: true, message: "Funcionalidad de edición próximamente", severity: "info" })
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
          <CloudUpload sx={{ fontSize: 48, opacity: 0.9 }} />
          <Box>
            <Typography variant="h4" fontWeight={700}>
              Mis Exámenes
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Gestiona los exámenes que has subido a la plataforma
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

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total de Exámenes
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                {myExams.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Aprobados
              </Typography>
              <Typography variant="h4" fontWeight={700} color="success.main">
                {myExams.filter((e) => e.status === "approved").length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Pendientes
              </Typography>
              <Typography variant="h4" fontWeight={700} color="warning.main">
                {myExams.filter((e) => e.status === "pending").length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Loading state */}
      {loading ? (
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ py: 8, textAlign: "center" }}>
            <CircularProgress />
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
              Cargando exámenes...
            </Typography>
          </CardContent>
        </Card>
      ) : filteredExams.length === 0 ? (
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ py: 8, textAlign: "center" }}>
            <CloudUpload sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              {searchQuery ? "No se encontraron exámenes" : "No has subido ningún examen aún"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchQuery
                ? "Intenta con otros términos de búsqueda"
                : "Comienza subiendo tu primer examen desde el menú"}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredExams.map((exam) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={exam.id}>
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
                    <Chip
                      label={getStatusLabel(exam.status)}
                      size="small"
                      color={getStatusColor(exam.status) as any}
                      sx={{ fontWeight: 600 }}
                    />
                  </Stack>

                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {exam.title}
                  </Typography>

                  <Stack spacing={1} mb={2}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <School fontSize="small" color="action" />
                      <Typography variant="body2">{exam.course}</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Person fontSize="small" color="action" />
                      <Typography variant="body2">{exam.teacher}</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CalendarToday fontSize="small" color="action" />
                      <Typography variant="body2">
                        {exam.cycle} - {exam.unit} - Sección {exam.section}
                      </Typography>
                    </Stack>
                  </Stack>

                  <Stack direction="row" spacing={2} mb={2}>
                    <Typography variant="caption" color="text.secondary">
                      Subido: {exam.uploadDate instanceof Date ? exam.uploadDate.toLocaleDateString() : new Date(exam.uploadDate as string).toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {exam.downloads} descargas
                    </Typography>
                  </Stack>
                </CardContent>

                <CardActions sx={{ px: 2, pb: 2, justifyContent: "space-between" }}>
                  <Stack direction="row" spacing={1}>
                    <Button size="small" startIcon={<Visibility />} onClick={() => handleView(exam.filePath)}>
                      Ver
                    </Button>
                    <Button size="small" startIcon={<Download />} onClick={() => handleDownload(exam.filePath, exam.fileName)}>
                      Descargar
                    </Button>
                  </Stack>
                  <Stack direction="row" spacing={0.5}>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleEdit(exam.id)}
                      disabled={exam.status === "pending"}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => setDeleteDialog({ open: true, examId: exam.id, filePath: exam.filePath })}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Stack>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, examId: null, filePath: null })}
      >
        <DialogTitle>¿Eliminar examen?</DialogTitle>
        <DialogContent>
          <Typography>
            Esta acción no se puede deshacer. ¿Estás seguro de que deseas eliminar este examen?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, examId: null, filePath: null })}>
            Cancelar
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ open: false, message: "", severity: "success" })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  )
}
