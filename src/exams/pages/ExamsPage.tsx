import {
  Box,
  Typography,
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
  Container,
  Alert,
  Autocomplete,
  TextField,
  Pagination,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import Header from "../components/Header";
import { getAllExams, type Exam as ServiceExam } from "../services/exams.service";
import { getCourses } from "../services/courses.service";
import RatingBadge from "@/exams/components/RatingBadge";

// Ciclos romanos del I al X
const CYCLES = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

// ✅ OPTIMIZACIÓN: Constante de paginación
const EXAMS_PER_PAGE = 20;

export default function ExamsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [selectedExams, setSelectedExams] = useState<string[]>([]);

  const [allExams, setAllExams] = useState<ServiceExam[]>([]);
  const [filteredExams, setFilteredExams] = useState<ServiceExam[]>([]);

  const [allCourses, setAllCourses] = useState<string[]>([]);
  const [availableCourses, setAvailableCourses] = useState<string[]>([]);

  const [cycleFilter, setCycleFilter] = useState("");
  const [courseFilter, setCourseFilter] = useState<string | null>(null);

  const [searchError, setSearchError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ✅ NUEVO: Estado de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [paginatedExams, setPaginatedExams] = useState<ServiceExam[]>([]);

  // Cargar cursos y exámenes iniciales
  useEffect(() => {
    let mounted = true;

    const loadInitialData = async () => {
      try {
        setIsLoading(true);

        // Cargar todos los cursos
        const coursesData = await getCourses();
        if (mounted) {
          setAllCourses(coursesData);
          setAvailableCourses(coursesData);
        }

        // ✅ OPTIMIZACIÓN: Cargar solo exámenes aprobados (reduce reads)
        const examsData = await getAllExams({ status: "approved" });
        if (mounted) {
          setAllExams(examsData);
          setFilteredExams(examsData);
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadInitialData();

    return () => {
      mounted = false;
    };
  }, []);

  // ✅ NUEVO: Aplicar paginación cuando cambian los exámenes filtrados
  useEffect(() => {
    const total = Math.ceil(filteredExams.length / EXAMS_PER_PAGE);
    setTotalPages(total);

    // Resetear a página 1 cuando cambian los filtros
    setCurrentPage(1);
  }, [filteredExams]);

  // ✅ NUEVO: Actualizar exámenes paginados cuando cambia la página
  useEffect(() => {
    const startIndex = (currentPage - 1) * EXAMS_PER_PAGE;
    const endIndex = startIndex + EXAMS_PER_PAGE;
    setPaginatedExams(filteredExams.slice(startIndex, endIndex));
  }, [currentPage, filteredExams]);

  // Filtrar cursos disponibles según el ciclo seleccionado
  useEffect(() => {
    const filterCoursesByCycle = async () => {
      if (!cycleFilter) {
        setAvailableCourses(allCourses);
        return;
      }

      try {
        const coursesInCycle = await getCourses(cycleFilter);
        setAvailableCourses(coursesInCycle);

        if (courseFilter && !coursesInCycle.includes(courseFilter)) {
          setCourseFilter(null);
        }
      } catch (error) {
        console.error("Error al filtrar cursos:", error);
        setAvailableCourses([]);
      }
    };

    filterCoursesByCycle();
  }, [cycleFilter, allCourses, courseFilter]);

  // Función para aplicar filtros
  const handleSearch = async () => {
    if (!cycleFilter && !courseFilter) {
      setSearchError("Por favor selecciona al menos un filtro para buscar");
      return;
    }

    setSearchError("");
    setIsLoading(true);

    try {
      const filters: {
        cycle?: string;
        course?: string;
        status?: "approved";
      } = {
        status: "approved", // ✅ Siempre filtrar por aprobados
      };

      if (cycleFilter) filters.cycle = cycleFilter;
      if (courseFilter) filters.course = courseFilter;

      const examsData = await getAllExams(filters);

      setFilteredExams(examsData);

      if (examsData.length === 0) {
        setSearchError("No se encontraron exámenes con los filtros seleccionados");
      }
    } catch (error) {
      console.error("Error al buscar exámenes:", error);
      setSearchError("Error al realizar la búsqueda. Intenta nuevamente");
    } finally {
      setIsLoading(false);
    }
  };

  // Función para limpiar filtros
  const handleClearFilters = () => {
    setCycleFilter("");
    setCourseFilter(null);
    setSearchError("");
    setFilteredExams(allExams);
    setSelectedExams([]);
    setCurrentPage(1); // ✅ Resetear página
  };

  const toggleExam = (id: string) => {
    setSelectedExams((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    // ✅ Cambiar: Seleccionar solo los de la página actual
    if (selectedExams.length === paginatedExams.length) {
      setSelectedExams([]);
    } else {
      setSelectedExams(paginatedExams.map((e) => e.id));
    }
  };

  // ✅ NUEVO: Manejar cambio de página
  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Header title="Búsqueda de Exámenes" subtitle="Busca por ciclo y curso" />

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                select
                fullWidth
                label="Seleccionar Ciclo"
                value={cycleFilter}
                onChange={(e) => setCycleFilter(e.target.value)}
                size="medium"
              >
                {CYCLES.map((cycle) => (
                  <MenuItem key={cycle} value={cycle}>
                    Ciclo {cycle}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Autocomplete
                fullWidth
                options={availableCourses}
                value={courseFilter}
                onChange={(_, newValue) => setCourseFilter(newValue)}
                disabled={isLoading}
                renderInput={(params) => (
                  <TextField {...params} size="medium" label="Seleccionar curso" />
                )}
                noOptionsText={
                  cycleFilter
                    ? "No hay cursos en este ciclo"
                    : "No se encontraron cursos"
                }
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={handleSearch}
                disabled={isLoading}
                fullWidth
                size="large"
                sx={{ py: 1.5, fontWeight: 600, textTransform: "none" }}
              >
                {isLoading ? "Buscando..." : "Buscar"}
              </Button>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={handleClearFilters}
                disabled={isLoading}
                fullWidth
                size="large"
                sx={{ py: 1.5, fontWeight: 600, textTransform: "none" }}
              >
                Limpiar
              </Button>
            </Grid>

            <Grid size={{ xs: 12, md: 2 }}>
              <Box display="flex" justifyContent={{ xs: "center", md: "flex-end" }}>
                <ToggleButtonGroup
                  exclusive
                  value={viewMode}
                  onChange={(_, v) => v && setViewMode(v)}
                  disabled={isLoading}
                  size="medium"
                >
                  <ToggleButton value="grid">Grid</ToggleButton>
                  <ToggleButton value="table">Tabla</ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Grid>
          </Grid>

          {searchError && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              {searchError}
            </Alert>
          )}

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

          {/* ✅ NUEVO: Mostrar info de paginación */}
          {filteredExams.length > 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Mostrando {(currentPage - 1) * EXAMS_PER_PAGE + 1} -{" "}
              {Math.min(currentPage * EXAMS_PER_PAGE, filteredExams.length)} de{" "}
              {filteredExams.length} exámenes
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* ✅ CAMBIO: Usar paginatedExams en lugar de filteredExams */}
      {viewMode === "table" && paginatedExams.length > 0 && (
        <TableView
          filteredExams={paginatedExams}
          selectedExams={selectedExams}
          toggleExam={toggleExam}
          toggleAll={toggleAll}
        />
      )}

      {viewMode === "grid" && paginatedExams.length > 0 && (
        <GridView
          filteredExams={paginatedExams}
          selectedExams={selectedExams}
          toggleExam={toggleExam}
        />
      )}

      {/* ✅ NUEVO: Paginación */}
      {filteredExams.length > EXAMS_PER_PAGE && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
        </Box>
      )}

      {filteredExams.length === 0 && !isLoading && !searchError && (
        <Box textAlign="center" py={8}>
          <Typography variant="h6">No se encontraron exámenes</Typography>
          <Typography color="text.secondary">
            Ajusta los filtros de búsqueda
          </Typography>
        </Box>
      )}
    </Container>
  );
}

function TableView({
  filteredExams,
  selectedExams,
  toggleExam,
  toggleAll,
}: {
  filteredExams: ServiceExam[];
  selectedExams: string[];
  toggleExam: (id: string) => void;
  toggleAll: () => void;
}) {
  return (
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
            <TableCell>Profesor</TableCell>
            <TableCell>Tipo</TableCell>
            <TableCell>Fecha</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {filteredExams.map((exam) => {
            const fileType = exam.fileName?.toLowerCase().endsWith(".pdf")
              ? "pdf"
              : "image";

            return (
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
                    {exam.unit} {exam.section ? `- ${exam.section}` : ""}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip label={exam.course} />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{exam.teacher}</Typography>
                </TableCell>
                <TableCell>{fileType.toUpperCase()}</TableCell>
                <TableCell>
                  {exam.uploadDate
                    ? new Date(exam.uploadDate).toLocaleDateString()
                    : ""}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}

function GridView({
  filteredExams,
  selectedExams,
  toggleExam,
}: {
  filteredExams: ServiceExam[];
  selectedExams: string[];
  toggleExam: (id: string) => void;
}) {
  const navigate = useNavigate();
  return (
    <Grid container spacing={3}>
      {filteredExams.map((exam) => {
        return (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={exam.id} sx={{ display: "flex" }}>
            <Card
              sx={{
                position: "relative",
                border: selectedExams.includes(exam.id) ? "2px solid" : undefined,
                borderColor: "primary.main",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Checkbox
                checked={selectedExams.includes(exam.id)}
                onChange={() => toggleExam(exam.id)}
                sx={{ position: "absolute", top: 8, left: 8 }}
              />

              <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
                <Stack spacing={1}>
                  <Chip label={exam.course} size="small" />
                  <Typography variant="h6">{exam.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {exam.schoolTerm} - {exam.unit} {exam.section ? `- ${exam.section}` : ""}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Profesor: {exam.teacher}
                  </Typography>
                  <Typography variant="caption">
                    {exam.uploadDate
                      ? new Date(exam.uploadDate).toLocaleDateString()
                      : ""}
                  </Typography>
                </Stack>

                <Box display="flex" alignItems="center" mt="auto">
                  <Stack direction="row" spacing={1}>
                    <Button size="small" variant="contained">
                      Descargar
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => navigate(`/report/${exam.id}`)}
                    >
                      Reportar
                    </Button>
                  </Stack>
                </Box>
                <Box sx={{ my: 1 }}>
                  <RatingBadge summary={exam.ratingsSummary} />
                </Box>
                <Button onClick={() => navigate(`/exam/${exam.id}`)}>
                  Ver Detalles
                </Button>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
}