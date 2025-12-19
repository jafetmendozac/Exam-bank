import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

export default function UploadExamForm() {
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
      setExam({ ...exam, file: e.target.files[0] });
    }
  };

  const submitExam = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(exam);
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
                Subir documento
                <input hidden type="file" onChange={handleFile} />
              </Button>
            </Grid>

            {/* Submit */}
            <Grid size={{ xs: 12 }}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
              >
                Subir Examen
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
