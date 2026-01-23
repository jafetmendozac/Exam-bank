import { useState, useEffect } from "react";
import {
    Box,
    Card,
    CardContent,
    Grid,
    Typography,
    Stack,
    Button,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    LinearProgress,
    Alert,
    Snackbar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Badge,
    Avatar,
} from "@mui/material";
import {
    TrendingUp,
    CheckCircle,
    Cancel,
    Visibility,
    Description,
    Download,
    PendingActions,
    School,
    Person,
    Settings,
} from "@mui/icons-material";
import { getAllExams, updateExamStatus, getExamDownloadURL, type Exam } from "../../services/exams.service";

interface Stats {
    totalExams: number;
    pendingExams: number;
    approvedExams: number;
    rejectedExams: number;
    totalDownloads: number;
    totalUsers: number;
}

interface TopCourse {
    course: string;
    count: number;
}

interface TopTeacher {
    teacher: string;
    count: number;
}

export default function AdminPage() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<Stats>({
        totalExams: 0,
        pendingExams: 0,
        approvedExams: 0,
        rejectedExams: 0,
        totalDownloads: 0,
        totalUsers: 0,
    });

    const [pendingExams, setPendingExams] = useState<Exam[]>([]);
    const [topCourses, setTopCourses] = useState<TopCourse[]>([]);
    const [topTeachers, setTopTeachers] = useState<TopTeacher[]>([]);

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

    // Cargar datos del dashboard
    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const allExams = await getAllExams();

            // Calcular estadísticas
            const pending = allExams.filter((e: Exam) => e.status === "pending");
            const approved = allExams.filter((e: Exam) => e.status === "approved");
            const rejected = allExams.filter((e: Exam) => e.status === "rejected");
            const totalDownloads = allExams.reduce((sum: number, e: Exam) => sum + (e.downloads || 0), 0);

            setStats({
                totalExams: allExams.length,
                pendingExams: pending.length,
                approvedExams: approved.length,
                rejectedExams: rejected.length,
                totalDownloads,
                totalUsers: 0, // TODO: Implementar contador de usuarios
            });

            setPendingExams(pending.slice(0, 10)); // Solo los primeros 10

            // Top cursos
            const courseCounts = allExams.reduce((acc: Record<string, number>, exam: Exam) => {
                acc[exam.course] = (acc[exam.course] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            const sortedCourses: TopCourse[] = Object.entries(courseCounts)
                .map(([course, count]) => ({ course, count: count as number }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);

            setTopCourses(sortedCourses);

            // Top profesores
            const teacherCounts = allExams.reduce((acc: Record<string, number>, exam: Exam) => {
                acc[exam.teacher] = (acc[exam.teacher] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            const sortedTeachers: TopTeacher[] = Object.entries(teacherCounts)
                .map(([teacher, count]) => ({ teacher, count: count as number }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);

            setTopTeachers(sortedTeachers);
        } catch (error) {
            console.error("Error al cargar datos:", error);
            setSnackbar({
                open: true,
                message: "Error al cargar datos del dashboard",
                severity: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (examId: string) => {
        try {
            await updateExamStatus(examId, "approved");
            setPendingExams((prev) => prev.filter((e: Exam) => e.id !== examId));
            setStats((prev) => ({
                ...prev,
                pendingExams: prev.pendingExams - 1,
                approvedExams: prev.approvedExams + 1,
            }));
            setSnackbar({
                open: true,
                message: "Examen aprobado exitosamente",
                severity: "success",
            });
        } catch (error) {
            setSnackbar({
                open: true,
                message: "Error al aprobar examen",
                severity: "error",
            });
        }
    };

    const handleReject = async (examId: string) => {
        try {
            await updateExamStatus(examId, "rejected");
            setPendingExams((prev) => prev.filter((e: Exam) => e.id !== examId));
            setStats((prev) => ({
                ...prev,
                pendingExams: prev.pendingExams - 1,
                rejectedExams: prev.rejectedExams + 1,
            }));
            setSnackbar({
                open: true,
                message: "Examen rechazado",
                severity: "info",
            });
        } catch (error) {
            setSnackbar({
                open: true,
                message: "Error al rechazar examen",
                severity: "error",
            });
        }
    };

    const handlePreview = async (exam: Exam) => {
        setPreviewDialog({ open: true, exam });
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

    if (loading) {
        return (
            <Box sx={{ p: 3 }}>
                <LinearProgress />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: "center" }}>
                    Cargando dashboard...
                </Typography>
            </Box>
        );
    }

    return (
        <Box>
            {/* Top Header Bar */}
            <Box
                sx={{
                    position: "sticky",
                    top: 0,
                    zIndex: 1100,
                    bgcolor: "background.paper",
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    px: 4,
                    py: 2,
                }}
            >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                        <Typography variant="h5" fontWeight={700}>
                            Panel de Administración
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Gestiona y supervisa todos los exámenes de la plataforma
                        </Typography>
                    </Box>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <IconButton>
                            <Badge badgeContent={2} color="error">
                                <Visibility />
                            </Badge>
                        </IconButton>
                        <IconButton>
                            <Settings />
                        </IconButton>
                        <Avatar sx={{ bgcolor: "primary.main", width: 40, height: 40 }}>
                            <Person />
                        </Avatar>
                    </Stack>
                </Stack>
            </Box>

            {/* Content */}
            <Box sx={{ p: 4 }}>
                {/* Métricas principales */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    {/* Total Exámenes */}
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card
                            sx={{
                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                color: "white",
                            }}
                        >
                            <CardContent>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Box>
                                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                            Total Exámenes
                                        </Typography>
                                        <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
                                            {stats.totalExams}
                                        </Typography>
                                    </Box>
                                    <Description sx={{ fontSize: 48, opacity: 0.3 }} />
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Pendientes */}
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card
                            sx={{
                                background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                                color: "white",
                            }}
                        >
                            <CardContent>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Box>
                                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                            Pendientes
                                        </Typography>
                                        <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
                                            {stats.pendingExams}
                                        </Typography>
                                        {stats.totalExams > 0 && (
                                            <Typography variant="caption" sx={{ opacity: 0.8 }}>
                                                {((stats.pendingExams / stats.totalExams) * 100).toFixed(1)}% del total
                                            </Typography>
                                        )}
                                    </Box>
                                    <PendingActions sx={{ fontSize: 48, opacity: 0.3 }} />
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Aprobados */}
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card
                            sx={{
                                background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                                color: "white",
                            }}
                        >
                            <CardContent>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Box>
                                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                            Aprobados
                                        </Typography>
                                        <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
                                            {stats.approvedExams}
                                        </Typography>
                                        {stats.totalExams > 0 && (
                                            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                                                <TrendingUp fontSize="small" />
                                                <Typography variant="caption">
                                                    {((stats.approvedExams / stats.totalExams) * 100).toFixed(1)}%
                                                </Typography>
                                            </Stack>
                                        )}
                                    </Box>
                                    <CheckCircle sx={{ fontSize: 48, opacity: 0.3 }} />
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Descargas */}
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card
                            sx={{
                                background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
                                color: "white",
                            }}
                        >
                            <CardContent>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Box>
                                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                            Descargas
                                        </Typography>
                                        <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
                                            {stats.totalDownloads}
                                        </Typography>
                                        <Typography variant="caption" sx={{ opacity: 0.8 }}>
                                            Total acumulado
                                        </Typography>
                                    </Box>
                                    <Download sx={{ fontSize: 48, opacity: 0.3 }} />
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <Grid container spacing={3}>
                    {/* Exámenes Pendientes de Aprobación */}
                    <Grid size={{ xs: 12, lg: 8 }}>
                        <Card>
                            <CardContent>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                                    <Typography variant="h6" fontWeight={600}>
                                        Exámenes Pendientes de Aprobación
                                    </Typography>
                                    <Chip label={`${stats.pendingExams} pendientes`} color="warning" />
                                </Stack>

                                {pendingExams.length === 0 ? (
                                    <Box sx={{ py: 8, textAlign: "center" }}>
                                        <CheckCircle sx={{ fontSize: 64, color: "success.main", mb: 2 }} />
                                        <Typography variant="h6" gutterBottom>
                                            ¡Todo al día!
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            No hay exámenes pendientes de revisión
                                        </Typography>
                                    </Box>
                                ) : (
                                    <TableContainer>
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Examen</TableCell>
                                                    <TableCell>Curso</TableCell>
                                                    <TableCell>Profesor</TableCell>
                                                    <TableCell>Fecha</TableCell>
                                                    <TableCell align="right">Acciones</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {pendingExams.map((exam) => (
                                                    <TableRow key={exam.id} hover>
                                                        <TableCell>
                                                            <Typography variant="body2" fontWeight={600}>
                                                                {exam.title}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {exam.cycle} - {exam.unit}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip label={exam.course} size="small" />
                                                        </TableCell>
                                                        <TableCell>{exam.teacher}</TableCell>
                                                        <TableCell>
                                                            {exam.uploadDate ? new Date(exam.uploadDate).toLocaleDateString() : ""}
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                                <IconButton
                                                                    size="small"
                                                                    color="info"
                                                                    onClick={() => handlePreview(exam)}
                                                                >
                                                                    <Visibility fontSize="small" />
                                                                </IconButton>
                                                                <IconButton
                                                                    size="small"
                                                                    color="success"
                                                                    onClick={() => handleApprove(exam.id)}
                                                                >
                                                                    <CheckCircle fontSize="small" />
                                                                </IconButton>
                                                                <IconButton
                                                                    size="small"
                                                                    color="error"
                                                                    onClick={() => handleReject(exam.id)}
                                                                >
                                                                    <Cancel fontSize="small" />
                                                                </IconButton>
                                                            </Stack>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Estadísticas laterales */}
                    <Grid size={{ xs: 12, lg: 4 }}>
                        <Stack spacing={3}>
                            {/* Top Cursos */}
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" fontWeight={600} mb={2}>
                                        Top Cursos
                                    </Typography>
                                    <Stack spacing={2}>
                                        {topCourses.map((item) => (
                                            <Box key={item.course}>
                                                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <School fontSize="small" color="action" />
                                                        <Typography variant="body2">{item.course}</Typography>
                                                    </Stack>
                                                    <Chip label={item.count} size="small" color="primary" />
                                                </Stack>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={(item.count / stats.totalExams) * 100}
                                                    sx={{ height: 6, borderRadius: 3 }}
                                                />
                                            </Box>
                                        ))}
                                    </Stack>
                                </CardContent>
                            </Card>

                            {/* Top Profesores */}
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" fontWeight={600} mb={2}>
                                        Top Profesores
                                    </Typography>
                                    <Stack spacing={2}>
                                        {topTeachers.map((item) => (
                                            <Stack
                                                key={item.teacher}
                                                direction="row"
                                                justifyContent="space-between"
                                                alignItems="center"
                                            >
                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    <Person fontSize="small" color="action" />
                                                    <Typography variant="body2">{item.teacher}</Typography>
                                                </Stack>
                                                <Typography variant="body2" fontWeight={600} color="primary">
                                                    {item.count} exámenes
                                                </Typography>
                                            </Stack>
                                        ))}
                                    </Stack>
                                </CardContent>
                            </Card>

                            {/* Resumen de Estados */}
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" fontWeight={600} mb={2}>
                                        Resumen por Estado
                                    </Typography>
                                    <Stack spacing={2}>
                                        <Box>
                                            <Stack direction="row" justifyContent="space-between" mb={1}>
                                                <Typography variant="body2">Aprobados</Typography>
                                                <Typography variant="body2" fontWeight={600}>
                                                    {((stats.approvedExams / stats.totalExams) * 100).toFixed(0)}%
                                                </Typography>
                                            </Stack>
                                            <LinearProgress
                                                variant="determinate"
                                                value={(stats.approvedExams / stats.totalExams) * 100}
                                                color="success"
                                                sx={{ height: 8, borderRadius: 4 }}
                                            />
                                        </Box>

                                        <Box>
                                            <Stack direction="row" justifyContent="space-between" mb={1}>
                                                <Typography variant="body2">Pendientes</Typography>
                                                <Typography variant="body2" fontWeight={600}>
                                                    {((stats.pendingExams / stats.totalExams) * 100).toFixed(0)}%
                                                </Typography>
                                            </Stack>
                                            <LinearProgress
                                                variant="determinate"
                                                value={(stats.pendingExams / stats.totalExams) * 100}
                                                color="warning"
                                                sx={{ height: 8, borderRadius: 4 }}
                                            />
                                        </Box>

                                        <Box>
                                            <Stack direction="row" justifyContent="space-between" mb={1}>
                                                <Typography variant="body2">Rechazados</Typography>
                                                <Typography variant="body2" fontWeight={600}>
                                                    {((stats.rejectedExams / stats.totalExams) * 100).toFixed(0)}%
                                                </Typography>
                                            </Stack>
                                            <LinearProgress
                                                variant="determinate"
                                                value={(stats.rejectedExams / stats.totalExams) * 100}
                                                color="error"
                                                sx={{ height: 8, borderRadius: 4 }}
                                            />
                                        </Box>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Stack>
                    </Grid>
                </Grid>

                {/* Dialog de Preview */}
                <Dialog
                    open={previewDialog.open}
                    onClose={() => setPreviewDialog({ open: false, exam: null })}
                    maxWidth="sm"
                    fullWidth
                >
                    {previewDialog.exam && (
                        <>
                            <DialogTitle>Vista Previa del Examen</DialogTitle>
                            <DialogContent>
                                <Stack spacing={2}>
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
                                            Archivo
                                        </Typography>
                                        <Typography variant="body2">{previewDialog.exam.fileName}</Typography>
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
                                <Button
                                    variant="contained"
                                    color="success"
                                    onClick={() => {
                                        handleApprove(previewDialog.exam!.id);
                                        setPreviewDialog({ open: false, exam: null });
                                    }}
                                >
                                    Aprobar
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
        </Box>
    );
}