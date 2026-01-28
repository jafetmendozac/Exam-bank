import { useState, useEffect } from "react"
import type { FormEvent } from "react"
import { useParams, useNavigate } from "react-router-dom"

import {
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
  Stack,
} from "@mui/material"
import { ReportProblem, Send, CheckCircle } from "@mui/icons-material"
import { PageContainer } from "../components/PageContainer"
import Header from "../components/Header"


export default function ReportPage() {
  const { examId } = useParams<{ examId: string }>()

  const [formData, setFormData] = useState({
    reportType: "",
    course: "",
    examId: examId ?? "",
    priority: "medium",
    subject: "",
    description: "",
    email: "",
  })
  const navigate = useNavigate()

  useEffect(() => {
    // If report page is accessed without an examId, redirect to exams
    if (!examId) {
      navigate("/exams", { replace: true })
    }
  }, [examId, navigate])

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

  return (
    <PageContainer>

      <Header icon={<ReportProblem sx={{ fontSize: 40, color: "warning.main" }} />} title="Reportar Irregularidad" subtitle="Ayúdanos a mantener la calidad del banco de exámenes"/>
        
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

            <Button
              type="submit"
              variant="contained"
              size="large"
              startIcon={<Send />}
              disabled={
                !formData.reportType || !formData.course || !formData.subject || !formData.description
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
    </PageContainer>
  )
}
