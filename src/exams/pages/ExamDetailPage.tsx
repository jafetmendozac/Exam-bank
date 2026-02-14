import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    Stack,
    Chip,
    Divider,
    Container,
    IconButton,
    CircularProgress,
} from "@mui/material";
import {
    Download,
    School,
    Person,
    CalendarToday,
    Description,
    ArrowBack,
    Favorite,
    FavoriteBorder,
} from "@mui/icons-material";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/app/firebase";
import type { Exam } from "@/exams/services/exams.service";
import RatingSection from "@/exams/components/RatingSection";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function ExamDetailPage() {
    const { examId } = useParams<{ examId: string }>();
    const navigate = useNavigate();

    const [exam, setExam] = useState<Exam | null>(null);
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        if (examId) {
            loadExam(examId);
        }
    }, [examId]);

    const loadExam = async (id: string) => {
        try {
            const examDoc = await getDoc(doc(db, "exams", id));

            if (!examDoc.exists()) {
                console.error("Examen no encontrado");
                setLoading(false);
                return;
            }

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
                    average: 0,
                    count: 0,
                    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
                },
            };

            setExam(examData);
        } catch (error) {
            console.error("Error al cargar examen:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        if (!exam) return;
        window.open(exam.fileUrl, "_blank");

        // TODO: Incrementar contador de descargas
        // await updateDoc(doc(db, "exams", exam.id), {
        //   downloads: increment(1)
        // });
    };

    const handleFavorite = () => {
        // TODO: Implementar favoritos
        setIsFavorite(!isFavorite);
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4, textAlign: "center" }}>
                <CircularProgress />
            </Container>
        );
    }

    if (!exam) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Typography variant="h5">Examen no encontrado</Typography>
                <Button onClick={() => navigate("/exams")} sx={{ mt: 2 }}>
                    Volver a Exámenes
                </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Back Button */}
            <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate("/exams")}
                sx={{ mb: 3 }}
            >
                Volver a Exámenes
            </Button>

            {/* Información del Examen */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Stack spacing={3}>
                        {/* Header */}
                        <Box>
                            <Typography variant="h4" fontWeight="bold" gutterBottom>
                                {exam.title}
                            </Typography>

                            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                                <Chip
                                    label={exam.schoolTerm}
                                    color="primary"
                                    variant="outlined"
                                />
                                <Chip
                                    label={`Ciclo ${exam.cycle}`}
                                    color="secondary"
                                    variant="outlined"
                                />
                                <Chip
                                    label={`Unidad ${exam.unit}`}
                                    variant="outlined"
                                />
                                {exam.section && (
                                    <Chip
                                        label={`Sección ${exam.section}`}
                                        variant="outlined"
                                    />
                                )}
                            </Stack>
                        </Box>

                        <Divider />

                        {/* Detalles */}
                        <Stack spacing={2}>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <School color="action" />
                                <Typography variant="body1">
                                    <strong>Curso:</strong> {exam.course}
                                </Typography>
                            </Stack>

                            <Stack direction="row" spacing={1} alignItems="center">
                                <Person color="action" />
                                <Typography variant="body1">
                                    <strong>Profesor:</strong> {exam.teacher}
                                </Typography>
                            </Stack>

                            <Stack direction="row" spacing={1} alignItems="center">
                                <CalendarToday color="action" />
                                <Typography variant="body1">
                                    <strong>Subido:</strong>{" "}
                                    {format(exam.uploadDate, "dd 'de' MMMM, yyyy", { locale: es })}
                                </Typography>
                            </Stack>

                            <Stack direction="row" spacing={1} alignItems="center">
                                <Download color="action" />
                                <Typography variant="body1">
                                    <strong>Descargas:</strong> {exam.downloads}
                                </Typography>
                            </Stack>
                        </Stack>

                        <Divider />

                        {/* Botones de Acción */}
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Button
                                variant="contained"
                                size="large"
                                startIcon={<Download />}
                                onClick={handleDownload}
                            >
                                Descargar Examen
                            </Button>

                            <IconButton
                                onClick={handleFavorite}
                                color={isFavorite ? "error" : "default"}
                                size="large"
                            >
                                {isFavorite ? <Favorite /> : <FavoriteBorder />}
                            </IconButton>

                            <Typography variant="caption" color="text.secondary">
                                {exam.fileName}
                            </Typography>
                        </Stack>
                    </Stack>
                </CardContent>
            </Card>

            {/* ✅ SECCIÓN DE RATING - AQUÍ CALIFICAN LOS USUARIOS */}
            <RatingSection examId={exam.id} />
        </Container>
    );
}