import { useState, useEffect } from "react";
import {
    Box,
    Card,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    Stack,
    TextField,
    MenuItem,
    Pagination,
    Avatar,
    Snackbar,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";
import {
    CheckCircle,
    Cancel,
    Visibility,
    Download,
    MoreVert,
    Search,
} from "@mui/icons-material";
import { getAllExams, updateExamStatus, getExamDownloadURL, type Exam } from "../../services/exams.service";

export default function ManageExamsPage() {
    const [exams, setExams] = useState<Exam[]>([]);
    const [filteredExams, setFilteredExams] = useState<Exam[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage] = useState(10);

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success" as "success" | "error" | "info",
    });

    const [previewDialog, setPreviewDialog] = useState<{
        open: boolean;
        exam: Exam | null;
    }>({
        open: false,
        exam: null,
    });

    useEffect(() => {
        loadExams();
    }, []);

    useEffect(() => {
        filterExams();
    }, [exams, statusFilter, searchQuery]);

    const loadExams = async () => {
        try {
            const data = await getAllExams();
            setExams(data);
        } catch (error) {
            console.error("Error loading exams:", error);
        }
    };

    const filterExams = () => {
        let filtered = [...exams];

        if (statusFilter !== "all") {
            filtered = filtered.filter((e) => e.status === statusFilter);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (e) =>
                    e.title.toLowerCase().includes(query) ||
                    e.course.toLowerCase().includes(query) ||
                    e.teacher.toLowerCase().includes(query)
            );
        }

        setFilteredExams(filtered);
        setPage(0);
    };

    const handleStatusChange = async (examId: string, newStatus: "approved" | "rejected") => {
        try {
            await updateExamStatus(examId, newStatus);
            setExams((prev) =>
                prev.map((e) => (e.id === examId ? { ...e, status: newStatus } : e))
            );
            setSnackbar({
                open: true,
                message: `Examen ${newStatus === "approved" ? "aprobado" : "rechazado"} exitosamente`,
                severity: "success",
            });
        } catch (error) {
            setSnackbar({
                open: true,
                message: "Error al actualizar estado",
                severity: "error",
            });
        }
    };

    const handleViewFile = async (filePath: string) => {
        try {
            const fileUrl = await getExamDownloadURL(filePath);
            window.open(fileUrl, "_blank");
        } catch (error) {
            setSnackbar({
                open: true,
                message: "Error al abrir archivo",
                severity: "error",
            });
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "approved":
                return "success";
            case "pending":
                return "warning";
            case "rejected":
                return "error";
            default:
                return "default";
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "approved":
                return "Aprobado";
            case "pending":
                return "Pendiente";
            case "rejected":
                return "Rechazado";
            default:
                return status;
        }
    };

    const paginatedExams = filteredExams.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    return (
        <Box sx={{ p: 4 }}>
            {/* Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
                <Box>
                    <Typography variant="h4" fontWeight={700}>
                        Gestionar Exámenes
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Administra y revisa los exámenes subidos por los usuarios
                    </Typography>
                </Box>
                <Button variant="contained" startIcon={<Download />}>
                    Exportar
                </Button>
            </Stack>

            {/* Filters */}
            <Card sx={{ mb: 3, p: 2 }}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <TextField
                        placeholder="Buscar por curso, profesor o título..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        size="small"
                        fullWidth
                        InputProps={{
                            startAdornment: <Search sx={{ mr: 1, color: "text.secondary" }} />,
                        }}
                    />
                    <TextField
                        select
                        label="Estado"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        size="small"
                        sx={{ minWidth: 150 }}
                    >
                        <MenuItem value="all">Todos</MenuItem>
                        <MenuItem value="pending">Pendientes</MenuItem>
                        <MenuItem value="approved">Aprobados</MenuItem>
                        <MenuItem value="rejected">Rechazados</MenuItem>
                    </TextField>
                    <TextField
                        select
                        label="Ordenar por"
                        defaultValue="date"
                        size="small"
                        sx={{ minWidth: 150 }}
                    >
                        <MenuItem value="date">Fecha</MenuItem>
                        <MenuItem value="course">Curso</MenuItem>
                        <MenuItem value="status">Estado</MenuItem>
                    </TextField>
                </Stack>
            </Card>

            {/* Table */}
            <Card>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Nombre</TableCell>
                                <TableCell>Estado</TableCell>
                                <TableCell>Curso</TableCell>
                                <TableCell>Profesor</TableCell>
                                <TableCell>Fecha</TableCell>
                                <TableCell>ID</TableCell>
                                <TableCell align="right">Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedExams.map((exam) => (
                                <TableRow key={exam.id} hover>
                                    <TableCell>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Avatar sx={{ bgcolor: "primary.main" }}>
                                                {exam.title.charAt(0)}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="body2" fontWeight={600}>
                                                    {exam.title}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {exam.unit} - Sección {exam.section}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={getStatusLabel(exam.status)}
                                            color={getStatusColor(exam.status) as any}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>{exam.course}</TableCell>
                                    <TableCell>{exam.teacher}</TableCell>
                                    <TableCell>
                                        {exam.uploadDate
                                            ? new Date(exam.uploadDate).toLocaleDateString("es-ES", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                            })
                                            : ""}
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="caption" color="text.secondary">
                                            {exam.id.slice(0, 8)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                            <IconButton
                                                size="small"
                                                onClick={() => setPreviewDialog({ open: true, exam })}
                                            >
                                                <Visibility fontSize="small" />
                                            </IconButton>
                                            {exam.status === "pending" && (
                                                <>
                                                    <IconButton
                                                        size="small"
                                                        color="success"
                                                        onClick={() => handleStatusChange(exam.id, "approved")}
                                                    >
                                                        <CheckCircle fontSize="small" />
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => handleStatusChange(exam.id, "rejected")}
                                                    >
                                                        <Cancel fontSize="small" />
                                                    </IconButton>
                                                </>
                                            )}
                                            <IconButton size="small">
                                                <MoreVert fontSize="small" />
                                            </IconButton>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Pagination */}
                <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                    <Pagination
                        count={Math.ceil(filteredExams.length / rowsPerPage)}
                        page={page + 1}
                        onChange={(_, value) => setPage(value - 1)}
                        color="primary"
                        size="large"
                    />
                </Box>
            </Card>

            {/* Preview Dialog */}
            <Dialog
                open={previewDialog.open}
                onClose={() => setPreviewDialog({ open: false, exam: null })}
                maxWidth="sm"
                fullWidth
            >
                {previewDialog.exam && (
                    <>
                        <DialogTitle>Detalles del Examen</DialogTitle>
                        <DialogContent>
                            <Stack spacing={2} sx={{ mt: 1 }}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">
                                        Título
                                    </Typography>
                                    <Typography variant="body1" fontWeight={600}>
                                        {previewDialog.exam.title}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">
                                        Curso
                                    </Typography>
                                    <Typography variant="body1">{previewDialog.exam.course}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">
                                        Profesor
                                    </Typography>
                                    <Typography variant="body1">{previewDialog.exam.teacher}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">
                                        Detalles
                                    </Typography>
                                    <Typography variant="body2">
                                        Ciclo {previewDialog.exam.cycle} - {previewDialog.exam.unit} - Sección{" "}
                                        {previewDialog.exam.section}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">
                                        Estado
                                    </Typography>
                                    <Box sx={{ mt: 0.5 }}>
                                        <Chip
                                            label={getStatusLabel(previewDialog.exam.status)}
                                            color={getStatusColor(previewDialog.exam.status) as any}
                                            size="small"
                                        />
                                    </Box>
                                </Box>
                            </Stack>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setPreviewDialog({ open: false, exam: null })}>
                                Cerrar
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={() => handleViewFile(previewDialog.exam!.filePath)}
                            >
                                Ver Archivo
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
}