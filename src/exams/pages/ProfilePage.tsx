import { useState } from "react"
import type { ChangeEvent } from "react"

import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Grid,
  IconButton,
  Divider,
  Alert,
  Snackbar,
} from "@mui/material"
import { PhotoCamera, Save, Cancel } from "@mui/icons-material"

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Mock user data
  const [userData, setUserData] = useState({
    firstName: "María",
    lastName: "García López",
    email: "maria.garcia@universidad.edu",
    studentId: "2021-0123",
    program: "Computer Science",
    year: "3rd Year",
    semester: "6th Semester",
    phone: "+34 612 345 678",
    avatarUrl: "",
  })

  const [formData, setFormData] = useState(userData)

  const handleChange =
    (field: keyof typeof userData) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [field]: event.target.value })
    }

  const handleSave = () => {
    setUserData(formData)
    setIsEditing(false)
    setShowSuccess(true)
  }

  const handleCancel = () => {
    setFormData(userData)
    setIsEditing(false)
  }

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setFormData({ ...formData, avatarUrl: reader.result as string })
    }
    reader.readAsDataURL(file)
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Mi Perfil
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Gestiona tu información personal y preferencias
        </Typography>
      </Box>

      <Paper sx={{ p: 4 }}>
        {/* Avatar */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
          <Box sx={{ position: "relative", mr: 3 }}>
            <Avatar
              src={formData.avatarUrl}
              sx={{
                width: 120,
                height: 120,
                bgcolor: "primary.main",
                fontSize: 48,
              }}
            >
              {!formData.avatarUrl &&
                `${formData.firstName[0]}${formData.lastName[0]}`}
            </Avatar>

            {isEditing && (
              <IconButton
                component="label"
                size="small"
                sx={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  bgcolor: "primary.main",
                  color: "white",
                  "&:hover": { bgcolor: "primary.dark" },
                }}
              >
                <PhotoCamera fontSize="small" />
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
              </IconButton>
            )}
          </Box>

          <Box>
            <Typography variant="h5" fontWeight={600}>
              {userData.firstName} {userData.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {userData.studentId} • {userData.program}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {userData.year} • {userData.semester}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Form */}
        <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
          Información Personal
        </Typography>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6}}>
            <TextField
              fullWidth
              label="Nombre"
              value={formData.firstName}
              onChange={handleChange("firstName")}
              disabled={!isEditing}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6}}>
            <TextField
              fullWidth
              label="Apellidos"
              value={formData.lastName}
              onChange={handleChange("lastName")}
              disabled={!isEditing}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6}}>
            <TextField
              fullWidth
              label="Correo Electrónico"
              type="email"
              value={formData.email}
              onChange={handleChange("email")}
              disabled={!isEditing}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6}}>
            <TextField
              fullWidth
              label="Teléfono"
              value={formData.phone}
              onChange={handleChange("phone")}
              disabled={!isEditing}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6}}>
            <TextField
              fullWidth
              label="Número de Estudiante"
              value={formData.studentId}
              disabled
              helperText="Este campo no se puede modificar"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6}}>
            <TextField
              fullWidth
              label="Programa / Carrera"
              value={formData.program}
              onChange={handleChange("program")}
              disabled={!isEditing}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6}}>
            <TextField
              fullWidth
              label="Año"
              value={formData.year}
              onChange={handleChange("year")}
              disabled={!isEditing}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6}}>
            <TextField
              fullWidth
              label="Semestre"
              value={formData.semester}
              onChange={handleChange("semester")}
              disabled={!isEditing}
            />
          </Grid>
        </Grid>

        {/* Buttons */}
        <Box sx={{ mt: 4, display: "flex", gap: 2 }}>
          {!isEditing ? (
            <Button variant="contained" size="large" onClick={() => setIsEditing(true)}>
              Editar Perfil
            </Button>
          ) : (
            <>
              <Button
                variant="contained"
                size="large"
                startIcon={<Save />}
                onClick={handleSave}
              >
                Guardar Cambios
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<Cancel />}
                onClick={handleCancel}
              >
                Cancelar
              </Button>
            </>
          )}
        </Box>
      </Paper>

      {/* Snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={4000}
        onClose={() => setShowSuccess(false)}
      >
        <Alert
          severity="success"
          onClose={() => setShowSuccess(false)}
          sx={{ width: "100%" }}
        >
          Perfil actualizado correctamente
        </Alert>
      </Snackbar>
    </Container>
  )
}
