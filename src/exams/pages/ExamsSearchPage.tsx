import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Card,
  CardContent,
  Grid,
  Chip,
  Checkbox,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Stack,
} from "@mui/material";
import { useState, useMemo } from "react";


type Exam = {
  id: string;
  title: string;
  description: string;
  subject: string;
  fileType: "pdf" | "image";
  uploadedAt: Date;
};


export default function ExamsSearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [selectedExams, setSelectedExams] = useState<string[]>([]);

  const exams: Exam[] = [
    {
      id: "1",
      title: "Examen Parcial",
      description: "Unidad 1",
      subject: "Matemáticas",
      fileType: "pdf",
      uploadedAt: new Date(),
    },
  ];

  const filteredExams = useMemo(() => {
    return exams.filter((e) =>
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedSubject ? e.subject === selectedSubject : true)
    );
  }, [searchTerm, selectedSubject, exams]);

  const toggleExam = (id: string) => {
    setSelectedExams((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedExams.length === filteredExams.length) {
      setSelectedExams([]);
    } else {
      setSelectedExams(filteredExams.map((e) => e.id));
    }
  };

  return (
    <Box maxWidth="lg" mx="auto" px={2} py={4}>
      {/* Header */}
      <Typography variant="h4" fontWeight={700}>
        Búsqueda de Exámenes
      </Typography>
      <Typography color="text.secondary" mb={4}>
        Busca por ciclo y curso
      </Typography>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Buscar por curso"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Select
                fullWidth
                value={selectedSubject}
                displayEmpty
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                <MenuItem value="">Todos los ciclos</MenuItem>
                <MenuItem value="Matemáticas">Matemáticas</MenuItem>
                <MenuItem value="Física">Física</MenuItem>
              </Select>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <ToggleButtonGroup
                exclusive
                value={viewMode}
                onChange={(_, v) => v && setViewMode(v)}
              >
                <ToggleButton value="grid">Grid</ToggleButton>
                <ToggleButton value="table">Tabla</ToggleButton>
              </ToggleButtonGroup>
            </Grid>
          </Grid>

          {selectedExams.length > 0 && (
            <Stack direction="row" spacing={2} mt={3}>
              <Typography variant="body2">
                {selectedExams.length} seleccionado(s)
              </Typography>
              <Button variant="contained">Descargar</Button>
              <Button variant="outlined" onClick={() => setSelectedExams([])}>
                Limpiar
              </Button>
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* TABLE VIEW */}
      {viewMode === "table" && (
        <Card>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={
                      selectedExams.length === filteredExams.length &&
                      filteredExams.length > 0
                    }
                    indeterminate={
                      selectedExams.length > 0 &&
                      selectedExams.length < filteredExams.length
                    }
                    onChange={toggleAll}
                  />
                </TableCell>
                <TableCell>Examen</TableCell>
                <TableCell>Materia</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Fecha</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredExams.map((exam) => (
                <TableRow key={exam.id} hover>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedExams.includes(exam.id)}
                      onChange={() => toggleExam(exam.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight={600}>{exam.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {exam.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={exam.subject} />
                  </TableCell>
                  <TableCell>{exam.fileType.toUpperCase()}</TableCell>
                  <TableCell>
                    {exam.uploadedAt.toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* GRID VIEW */}
      {viewMode === "grid" && (
        <Grid container spacing={3}>
          {filteredExams.map((exam) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={exam.id}>
              <Card
                sx={{
                  position: "relative",
                  border:
                    selectedExams.includes(exam.id)
                      ? "2px solid"
                      : undefined,
                  borderColor: "primary.main",
                }}
              >
                <Checkbox
                  checked={selectedExams.includes(exam.id)}
                  onChange={() => toggleExam(exam.id)}
                  sx={{ position: "absolute", top: 8, left: 8 }}
                />

                <CardContent>
                  <Stack spacing={1}>
                    <Chip label={exam.subject} size="small" />
                    <Typography variant="h6">{exam.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {exam.description}
                    </Typography>
                    <Typography variant="caption">
                      {exam.uploadedAt.toLocaleDateString()}
                    </Typography>

                    <Stack direction="row" spacing={1} mt={1}>
                      <Button size="small" variant="contained">
                        Ver
                      </Button>
                      <Button size="small" variant="outlined">
                        Descargar
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {filteredExams.length === 0 && (
        <Box textAlign="center" py={8}>
          <Typography variant="h6">No se encontraron exámenes</Typography>
          <Typography color="text.secondary">
            Ajusta los filtros de búsqueda
          </Typography>
        </Box>
      )}
    </Box>
  );
}
