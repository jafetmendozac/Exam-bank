import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Box,
    Typography,
    Button,
    Stack,
    Chip,
    Container,
    IconButton,
    CircularProgress,
    Snackbar,
    Alert,
    Tooltip,
} from "@mui/material";
import {
    Download,
    Visibility,
    Person,
    CalendarToday,
    ArrowBack,
    Favorite,
    FavoriteBorder,
    Star,
} from "@mui/icons-material";
import {
    doc,
    getDoc,
    updateDoc,
    increment,
    addDoc,
    collection,
    serverTimestamp,
} from "firebase/firestore";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { db } from "@/app/firebase";
import { useAuth } from "@/auth/context/useAuth";
import type { Exam } from "@/exams/services/exams.service";
import RatingSection from "@/exams/components/RatingSection";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function ExamDetailPage() {
    const { examId } = useParams<{ examId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [exam, setExam] = useState<Exam | null>(null);
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [viewing, setViewing] = useState(false);
    const [downloadCount, setDownloadCount] = useState(0);

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success" as "success" | "error" | "info",
    });

    useEffect(() => {
        if (examId) loadExam(examId);
    }, [examId]);

    const loadExam = async (id: string) => {
        try {
            const examDoc = await getDoc(doc(db, "exams", id));
            if (!examDoc.exists()) { setLoading(false); return; }
            const data = examDoc.data();
            const examData: Exam = {
                id: examDoc.id,
                userId: data.userId,
                title: data.title,
                course: data.course,
                teacher: data.teacher,
                cycle: data.cycle,
                schoolTerm: data.schoolTerm,
                unit: data.unit,
                section: data.section,
                uploadDate: data.uploadDate?.toDate() || new Date(),
                status: data.status || "pending",
                downloads: data.downloads || 0,
                fileUrl: data.fileUrl,
                fileName: data.fileName,
                filePath: data.filePath,
                ratingsSummary: data.ratingsSummary || {
                    average: 0, count: 0,
                    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
                },
            };
            setExam(examData);
            setDownloadCount(examData.downloads);
        } catch (error) {
            console.error("Error al cargar examen:", error);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Obtener URL de Firebase Storage via SDK (evita CORS)
     */
    const getFirebaseUrl = async (exam: Exam): Promise<string> => {
        if (exam.filePath) {
            const storage = getStorage();
            const fileRef = ref(storage, exam.filePath);
            return await getDownloadURL(fileRef);
        }
        return exam.fileUrl || "";
    };

    /**
     * Registrar descarga en Firestore
     */
    const registerDownload = async (examData: Exam) => {
        if (!user) return;
        try {
            await addDoc(collection(db, "downloadLogs"), {
                userId: user.uid,
                userEmail: user.email,
                examId: examData.id,
                examTitle: examData.title,
                course: examData.course,
                timestamp: serverTimestamp(),
            });
            await updateDoc(doc(db, "exams", examData.id), {
                downloads: increment(1),
            });
            setDownloadCount((prev) => prev + 1);
        } catch (error) {
            console.error("Error al registrar descarga:", error);
        }
    };

    /**
     * VER: Abre PDF en nueva pestaña (sin registrar descarga)
     */
    const handleView = async () => {
        if (!user) {
            setSnackbar({ open: true, message: "Inicia sesión para ver el examen", severity: "error" });
            return;
        }
        if (!exam) return;
        setViewing(true);
        try {
            const url = await getFirebaseUrl(exam);
            window.open(url, "_blank");
        } catch {
            setSnackbar({ open: true, message: "Error al abrir el archivo", severity: "error" });
        } finally {
            setViewing(false);
        }
    };

    /**
     * DESCARGAR: Descarga real al dispositivo + registra en Firestore
     */
    const handleDownload = async () => {
        if (!user) {
            setSnackbar({ open: true, message: "Inicia sesión para descargar", severity: "error" });
            return;
        }
        if (!exam) return;
        setDownloading(true);
        try {
            // 1. Obtener URL segura via Firebase SDK
            const url = await getFirebaseUrl(exam);

            // 2. Fetch como blob para descarga real
            const response = await fetch(url);
            const blob = await response.blob();

            // 3. Forzar descarga al dispositivo
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = exam.fileName || `${exam.title}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);

            // 4. Registrar en Firestore
            await registerDownload(exam);

            setSnackbar({ open: true, message: "✅ Descarga completada", severity: "success" });
        } catch (error) {
            console.error("Error al descargar:", error);
            // Fallback: abrir en nueva pestaña
            try {
                const url = await getFirebaseUrl(exam);
                window.open(url, "_blank");
                await registerDownload(exam);
                setSnackbar({ open: true, message: "Archivo abierto en nueva pestaña", severity: "info" });
            } catch {
                setSnackbar({ open: true, message: "Error al descargar", severity: "error" });
            }
        } finally {
            setDownloading(false);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh" flexDirection="column" gap={2}>
                <CircularProgress size={48} thickness={3} />
                <Typography color="text.secondary">Cargando examen...</Typography>
            </Box>
        );
    }

    if (!exam) {
        return (
            <Container maxWidth="md" sx={{ py: 8, textAlign: "center" }}>
                <Typography variant="h4" gutterBottom>😕 Examen no encontrado</Typography>
                <Button variant="contained" onClick={() => navigate("/exams")}>
                    Volver a Exámenes
                </Button>
            </Container>
        );
    }

    const rating = exam.ratingsSummary?.average || 0;
    const ratingCount = exam.ratingsSummary?.count || 0;

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>

            {/* Back */}
            <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate("/exams")}
                sx={{ mb: 3, color: "text.secondary", textTransform: "none" }}
            >
                Volver a Exámenes
            </Button>

            {/* ══════════════════════════════
          HERO CARD
      ══════════════════════════════ */}
            <Box
                sx={{
                    borderRadius: 4,
                    overflow: "hidden",
                    mb: 3,
                    background: (theme) =>
                        theme.palette.mode === "dark"
                            ? "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)"
                            : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    position: "relative",
                    boxShadow: "0 20px 60px rgba(102, 126, 234, 0.3)",
                }}
            >
                {/* Decoración de fondo */}
                <Box sx={{ position: "absolute", top: -50, right: -50, width: 250, height: 250, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
                <Box sx={{ position: "absolute", bottom: -80, right: 100, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />
                <Box sx={{ position: "absolute", top: "50%", left: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />

                <Box sx={{ p: { xs: 3, md: 5 }, position: "relative" }}>
                    {/* Chips */}
                    <Stack direction="row" spacing={1} flexWrap="wrap" gap={1} mb={2.5}>
                        {[
                            exam.schoolTerm,
                            `Ciclo ${exam.cycle}`,
                            `Unidad ${exam.unit}`,
                            exam.section ? `Sección ${exam.section}` : null,
                        ].filter(Boolean).map((label) => (
                            <Chip
                                key={label}
                                label={label}
                                size="small"
                                sx={{
                                    bgcolor: "rgba(255,255,255,0.18)",
                                    color: "white",
                                    fontWeight: 600,
                                    backdropFilter: "blur(10px)",
                                    border: "1px solid rgba(255,255,255,0.2)",
                                }}
                            />
                        ))}
                    </Stack>

                    {/* Título */}
                    <Typography
                        variant="h4"
                        fontWeight={800}
                        color="white"
                        sx={{ letterSpacing: -0.5, lineHeight: 1.2, mb: 1, maxWidth: 700 }}
                    >
                        {exam.title}
                    </Typography>

                    {/* Curso */}
                    <Typography
                        variant="h6"
                        sx={{ color: "rgba(255,255,255,0.8)", mb: 4, fontWeight: 400 }}
                    >
                        {exam.course}
                    </Typography>

                    {/* Stats */}
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={4}>
                        {[
                            { icon: <Person sx={{ fontSize: 18 }} />, label: "Profesor", value: exam.teacher },
                            { icon: <CalendarToday sx={{ fontSize: 18 }} />, label: "Subido", value: format(exam.uploadDate, "dd MMM yyyy", { locale: es }) },
                            { icon: <Download sx={{ fontSize: 18 }} />, label: "Descargas", value: String(downloadCount) },
                            ...(ratingCount > 0 ? [{ icon: <Star sx={{ fontSize: 18, color: "#FFD700" }} />, label: "Calificación", value: `${rating.toFixed(1)} (${ratingCount})` }] : []),
                        ].map((stat) => (
                            <Stack key={stat.label} direction="row" spacing={1.5} alignItems="center">
                                <Box sx={{ color: "rgba(255,255,255,0.6)" }}>{stat.icon}</Box>
                                <Box>
                                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.55)", display: "block", lineHeight: 1 }}>
                                        {stat.label}
                                    </Typography>
                                    <Typography variant="body2" color="white" fontWeight={700}>
                                        {stat.value}
                                    </Typography>
                                </Box>
                            </Stack>
                        ))}
                    </Stack>
                </Box>
            </Box>

            {/* ══════════════════════════════
          BOTONES DE ACCIÓN
      ══════════════════════════════ */}
            <Box
                sx={{
                    display: "flex",
                    gap: 2,
                    mb: 4,
                    flexWrap: "wrap",
                    alignItems: "center",
                    p: 3,
                    borderRadius: 3,
                    bgcolor: "background.paper",
                    border: "1px solid",
                    borderColor: "divider",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                }}
            >
                {/* VER */}
                <Tooltip title={!user ? "Inicia sesión para ver" : "Abre el PDF en el navegador sin descargar"}>
                    <span>
                        <Button
                            variant="outlined"
                            size="large"
                            startIcon={viewing ? <CircularProgress size={16} /> : <Visibility />}
                            onClick={handleView}
                            disabled={!user || viewing}
                            sx={{
                                borderRadius: 2,
                                px: 3,
                                py: 1.2,
                                fontWeight: 600,
                                textTransform: "none",
                                borderWidth: 2,
                                "&:hover": { borderWidth: 2 },
                            }}
                        >
                            {viewing ? "Abriendo..." : "Ver PDF"}
                        </Button>
                    </span>
                </Tooltip>

                {/* DESCARGAR */}
                <Tooltip title={!user ? "Inicia sesión para descargar" : "Descarga el archivo a tu dispositivo"}>
                    <span>
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={
                                downloading
                                    ? <CircularProgress size={16} color="inherit" />
                                    : <Download />
                            }
                            onClick={handleDownload}
                            disabled={!user || downloading}
                            sx={{
                                borderRadius: 2,
                                px: 4,
                                py: 1.2,
                                fontWeight: 700,
                                textTransform: "none",
                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                boxShadow: "0 4px 15px rgba(102,126,234,0.35)",
                                "&:hover": {
                                    background: "linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)",
                                    boxShadow: "0 6px 20px rgba(102,126,234,0.5)",
                                    transform: "translateY(-1px)",
                                },
                                transition: "all 0.2s ease",
                            }}
                        >
                            {downloading ? "Descargando..." : "Descargar"}
                        </Button>
                    </span>
                </Tooltip>

                {/* FAVORITO */}
                <Tooltip title={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}>
                    <IconButton
                        onClick={() => {
                            setIsFavorite(!isFavorite);
                            setSnackbar({
                                open: true,
                                message: isFavorite ? "Eliminado de favoritos" : "Guardado en favoritos ❤️",
                                severity: "success",
                            });
                        }}
                        size="large"
                        sx={{
                            border: "2px solid",
                            borderColor: isFavorite ? "error.main" : "divider",
                            color: isFavorite ? "error.main" : "text.secondary",
                            borderRadius: 2,
                            transition: "all 0.2s ease",
                            "&:hover": { borderColor: "error.main", color: "error.main", transform: "scale(1.05)" },
                        }}
                    >
                        {isFavorite ? <Favorite /> : <FavoriteBorder />}
                    </IconButton>
                </Tooltip>

                {/* Nombre del archivo */}
                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                        ml: "auto",
                        maxWidth: 250,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        display: { xs: "none", md: "block" },
                    }}
                >
                    📎 {exam.fileName}
                </Typography>
            </Box>

            {/* ══════════════════════════════
          CALIFICACIONES
      ══════════════════════════════ */}
            <Box sx={{ borderRadius: 3, overflow: "hidden", border: "1px solid", borderColor: "divider" }}>
                <RatingSection examId={exam.id} />
            </Box>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ borderRadius: 2 }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
}