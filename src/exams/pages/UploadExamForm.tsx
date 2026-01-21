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
  Autocomplete,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useAuth } from "@/auth/context/useAuth";
import { useNavigate } from "react-router-dom";
import { uploadExam } from "../services/exams.service";
import { getTeachers } from "../services/teachers.service";
import { getCourses } from "../services/courses.service";

function generateSchoolTerms(startYear: number, endYear: number): string[] {
  const periods = ["EXT", "I", "II"];
  const terms = [];

  for (let year = startYear; year <= endYear; year++) {
    for (const period of periods) {
      terms.push(`${year}-${period}`);
    }
  }

  return terms;
}


export default function UploadExamForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [teachers, setTeachers] = useState<string[]>([]);
  const [courses, setCourses] = useState<string[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [exam, setExam] = useState({
    unidad: "",
    semestre: "",
    seccion: "",
    profesor: "",
    ciclo: "",
    curso: "",
    file: null as File | null,
  });
  const [filteredCycles, setFilteredCycles] = useState<string[]>([]);

  const unities = ["Unidad I", "Unidad II", "Unidad III"];
  const sections = ["A", "B"];
  const schoolTerm = generateSchoolTerms(2019, 2025);
  const allCycles = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
  const oddCycles = ["I", "III", "V", "VII", "IX"];
  const evenCycles = ["II", "IV", "VI", "VIII", "X"];

  const getCyclesByPeriod = (period: string): string[] => {
    if (period.endsWith("-I")) {
      return oddCycles;
    } else if (period.endsWith("-II")) {
      return evenCycles;
    } else if (period.endsWith("-EXT")) {
      return allCycles;
    }
    return allCycles;
  };

  const handlePeriodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPeriod = e.target.value;
    const availableCycles = getCyclesByPeriod(newPeriod);

    setFilteredCycles(availableCycles);

    const isCycleValid = availableCycles.includes(exam.ciclo);

    setExam({
      ...exam,
      semestre: newPeriod,
      ciclo: isCycleValid ? exam.ciclo : "", // Limpiar si no es válido
    });
  };

  useEffect(() => {
    if (exam.semestre) {
      setFilteredCycles(getCyclesByPeriod(exam.semestre));
    } else {
      setFilteredCycles(allCycles);
    }
  }, [exam.semestre]);



  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true);
        const [teachersData, coursesData] = await Promise.all([
          getTeachers(),
          getCourses(),
        ]);
        setTeachers(teachersData);
        setCourses(coursesData);
      } catch (err) {
        console.error("Error al cargar datos:", err);
      } finally {
        setLoadingData(false);
      }
    };
    loadData();
  }, []);

  const handleChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setExam({ ...exam, [field]: e.target.value });
    };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];

      if (file.type !== "application/pdf") {
        setError("Solo se permiten archivos PDF");
        return;
      }
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
    if (!exam.unidad || !exam.semestre || !exam.seccion || !exam.profesor || !exam.ciclo || !exam.curso) {
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
      <Card sx={{ maxWidth: 700, width: "100%", borderRadius: 2 }}>
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
                label="Periodo"
                value={exam.semestre}
                onChange={handlePeriodChange}
              >
                {schoolTerm.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                label="Ciclo"
                value={exam.ciclo}
                onChange={handleChange("ciclo")}
                disabled={!exam.semestre}
              >
                {filteredCycles.map((c) => (
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
                label="Unidad"
                value={exam.unidad}
                onChange={handleChange("unidad")}
              >
                {unities.map((u) => (
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
                label="Sección"
                value={exam.seccion}
                onChange={handleChange("seccion")}
              >
                {sections.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Profesor */}
            <Grid size={{ xs: 12 }}>
              <Autocomplete
                options={teachers}
                value={exam.profesor || null}
                onChange={(_, newValue: string | null) => {
                  setExam({ ...exam, profesor: newValue || "" });
                }}
                loading={loadingData}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Profesor"
                    fullWidth
                    placeholder="Selecciona un profesor"
                  />
                )}
              />
            </Grid>

            {/* Ciclo - Curso */}

            <Grid size={{ xs: 12 }}>
              <Autocomplete
                options={courses}
                value={exam.curso || null}
                onChange={(_, newValue: string | null) => {
                  setExam({ ...exam, curso: newValue || "" });
                }}
                loading={loadingData}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Curso"
                    fullWidth
                    placeholder="Selecciona un curso"
                  />
                )}
              />
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
