import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  MenuItem,
  TextField,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useState } from "react";
import { useAuth } from "@/auth/context/useAuth";
import { useNavigate } from "react-router-dom";
import { uploadExam } from "../services/exams.service";

export default function UploadExamForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [otroProfesor, setOtroProfesor] = useState(false);
  const [exam, setExam] = useState({
    unidad: "",
    semestre: "",
    anio: "",
    seccion: "",
    profesor: "",
    ciclo: "",
    curso: "",
    file: null as File | null,
  });

  const unidades = ["Unidad 1", "Unidad 2"];
  const semestres = ["2024-I", "2024-II"];
  const anios = ["2023", "2024"];
  const secciones = ["A", "B"];
  const profesores = ["Juan Pérez", "María López"];
  const ciclos = ["I", "II", "III"];
  const cursos = ["Algoritmos", "Base de Datos"];

  const handleChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setExam({ ...exam, [field]: e.target.value });
    };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      // Validar que sea PDF
      if (file.type !== "application/pdf") {
        setError("Solo se permiten archivos PDF");
        return;
      }
      // Validar tamaño (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError("El archivo no debe exceder 10MB");
        return;
      }
      setExam({ ...exam, file });
      setError("");
    }
  };

  const submitExam = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validar que todos los campos estén llenos
    if (!exam.unidad || !exam.semestre || !exam.anio || !exam.seccion || !exam.profesor || !exam.ciclo || !exam.curso) {
      setError("Por favor completa todos los campos");
      return;
    }

    if (!exam.file) {
      setError("Por favor selecciona un archivo PDF");
      return;
    }

    if (!user) {
      setError("Debes estar autenticado para subir exámenes");
      return;
    }

    setLoading(true);
    try {
      await uploadExam(user, {
        unidad: exam.unidad,
        semestre: exam.semestre,
        anio: exam.anio,
        seccion: exam.seccion,
        profesor: exam.profesor,
        ciclo: exam.ciclo,
        curso: exam.curso,
        file: exam.file,
      });

      setSuccess(true);
      // Limpiar formulario
      setExam({
        unidad: "",
        semestre: "",
        anio: "",
        seccion: "",
        profesor: "",
        ciclo: "",
        curso: "",
        file: null,
      });
      
      // Redirigir a mis exámenes después de 2 segundos
      setTimeout(() => {
        navigate("/my-exams");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir el examen. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 65px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 700, width: "100%", borderRadius: 4 }}>
        <CardContent component="form" onSubmit={submitExam} sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight={600} mb={3}>
            Subir Examen
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              ¡Examen subido exitosamente! Redirigiendo a Mis Exámenes...
            </Alert>
          )}

          {/* Unidad - Semestre */}
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                label="Unidad"
                value={exam.unidad}
                onChange={handleChange("unidad")}
              >
                {unidades.map((u) => (
                  <MenuItem key={u} value={u}>
                    {u}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                label="Semestre"
                value={exam.semestre}
                onChange={handleChange("semestre")}
              >
                {semestres.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Año - Sección */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                label="Año"
                value={exam.anio}
                onChange={handleChange("anio")}
              >
                {anios.map((a) => (
                  <MenuItem key={a} value={a}>
                    {a}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                label="Sección"
                value={exam.seccion}
                onChange={handleChange("seccion")}
              >
                {secciones.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Profesor */}
            <Grid size={{ xs: 12 }}>
              {!otroProfesor ? (
                <TextField
                  select
                  fullWidth
                  label="Profesor"
                  value={exam.profesor}
                  onChange={handleChange("profesor")}
                >
                  {profesores.map((p) => (
                    <MenuItem key={p} value={p}>
                      {p}
                    </MenuItem>
                  ))}
                </TextField>
              ) : (
                <TextField
                  fullWidth
                  label="Profesor"
                  value={exam.profesor}
                  onChange={handleChange("profesor")}
                />
              )}

              <Button
                sx={{ mt: 1 }}
                size="small"
                onClick={() => setOtroProfesor(!otroProfesor)}
              >
                {otroProfesor ? "Cancelar" : "Otro"}
              </Button>
            </Grid>

            {/* Ciclo - Curso */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                label="Ciclo"
                value={exam.ciclo}
                onChange={handleChange("ciclo")}
              >
                {ciclos.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                label="Curso"
                value={exam.curso}
                onChange={handleChange("curso")}
              >
                {cursos.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Archivo */}
            <Grid size={{ xs: 12 }}>
              <Button component="label" variant="outlined" fullWidth>
                {exam.file ? exam.file.name : "Subir documento PDF"}
                <input hidden type="file" accept="application/pdf" onChange={handleFile} />
              </Button>
              {exam.file && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                  Archivo seleccionado: {exam.file.name} ({(exam.file.size / 1024 / 1024).toFixed(2)} MB)
                </Typography>
              )}
            </Grid>

            {/* Submit */}
            <Grid size={{ xs: 12 }}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading || success}
              >
                {loading ? <CircularProgress size={24} /> : "Subir Examen"}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
