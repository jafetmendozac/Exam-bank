import { useState } from "react"
import type { FormEvent } from "react"

import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  MenuItem,
  Alert,
  FormControl,
  InputLabel,
  Select,
  Card,
  CardContent,
  Chip,
  Stack,
} from "@mui/material"
import { ReportProblem, Send, CheckCircle } from "@mui/icons-material"


export default function ReportPage() {
  const [formData, setFormData] = useState({
    reportType: "",
    course: "",
    examId: "",
    priority: "medium",
    subject: "",
    description: "",
    email: "",
  })

  const [submitted, setSubmitted] = useState(false)

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    // Simular envío
    setSubmitted(true)

    setTimeout(() => {
      setFormData({
        reportType: "",
        course: "",
        examId: "",
        priority: "medium",
        subject: "",
        description: "",
        email: "",
      })
      setSubmitted(false)
    }, 3000)
  }

  const reportTypes = [
    { value: "content_error", label: "Error en el contenido del examen" },
    { value: "wrong_file", label: "Archivo incorrecto o corrupto" },
    { value: "inappropriate", label: "Contenido inapropiado" },
    { value: "copyright", label: "Violación de derechos de autor" },
    { value: "duplicate", label: "Examen duplicado" },
    { value: "wrong_metadata", label: "Información incorrecta" },
    { value: "quality", label: "Mala calidad del archivo" },
    { value: "other", label: "Otro" },
  ]

  const courses = [
    "Cálculo I",
    "Cálculo II",
    "Álgebra Lineal",
    "Física I",
    "Programación I",
    "Estructuras de Datos",
    "Base de Datos",
    "Redes",
  ]

  const priorities = [
    { value: "low", label: "Baja", color: "success" },
    { value: "medium", label: "Media", color: "warning" },
    { value: "high", label: "Alta", color: "error" },
  ]

  return (
      <Container maxWidth="md">
        <Box sx={{ py: 4 }}>
          {/* Header */}
          <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
            <ReportProblem sx={{ fontSize: 40, color: "warning.main" }} />
            <Box>
              <Typography variant="h4" fontWeight={700}>
                Reportar Irregularidad
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Ayúdanos a mantener la calidad del banco de exámenes
              </Typography>
            </Box>
          </Box>

          {/* Info cards */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={4}>
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600}>
                  ¿Qué puedes reportar?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Errores de contenido, archivos dañados, información incorrecta y más.
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600}>
                  Tiempo de respuesta
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Revisaremos tu reporte en 24–48 horas.
                </Typography>
              </CardContent>
            </Card>
          </Stack>

          {/* Success */}
          {submitted && (
            <Alert icon={<CheckCircle />} severity="success" sx={{ mb: 3 }}>
              ¡Reporte enviado exitosamente! Gracias por tu ayuda.
            </Alert>
          )}

          {/* Form */}
          <Paper sx={{ p: 4 }}>
            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <FormControl fullWidth required>
                  <InputLabel>Tipo de Reporte</InputLabel>
                  <Select
                    label="Tipo de Reporte"
                    value={formData.reportType}
                    onChange={(e) => handleChange("reportType", e.target.value)}
                  >
                    {reportTypes.map((t) => (
                      <MenuItem key={t.value} value={t.value}>
                        {t.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <FormControl fullWidth required>
                    <InputLabel>Curso</InputLabel>
                    <Select
                      label="Curso"
                      value={formData.course}
                      onChange={(e) => handleChange("course", e.target.value)}
                    >
                      {courses.map((c) => (
                        <MenuItem key={c} value={c}>
                          {c}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    fullWidth
                    label="ID del Examen (opcional)"
                    value={formData.examId}
                    onChange={(e) => handleChange("examId", e.target.value)}
                  />
                </Stack>

                <FormControl fullWidth required>
                  <InputLabel>Prioridad</InputLabel>
                  <Select
                    label="Prioridad"
                    value={formData.priority}
                    onChange={(e) => handleChange("priority", e.target.value)}
                  >
                    {priorities.map((p) => (
                      <MenuItem key={p.value} value={p.value}>
                        <Chip
                          label={p.label}
                          color={p.color as any}
                          size="small"
                        />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  required
                  label="Asunto"
                  value={formData.subject}
                  onChange={(e) => handleChange("subject", e.target.value)}
                />

                <TextField
                  fullWidth
                  required
                  multiline
                  rows={6}
                  label="Descripción"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  inputProps={{ maxLength: 1000 }}
                  helperText={`${formData.description.length}/1000`}
                />

                <TextField
                  fullWidth
                  required
                  type="email"
                  label="Tu Email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  startIcon={<Send />}
                  disabled={
                    !formData.reportType ||
                    !formData.course ||
                    !formData.subject ||
                    !formData.description ||
                    !formData.email
                  }
                >
                  Enviar Reporte
                </Button>

                <Typography variant="caption" color="text.secondary" align="center">
                  Todos los reportes son confidenciales.
                </Typography>
              </Stack>
            </form>
          </Paper>
        </Box>
      </Container>
  )
}
