import { useState, useEffect } from "react";
import {
    Box,
    Typography,
    TextField,
    Button,
    Card,
    CardContent,
    Stack,
    Rating,
    IconButton,
    Chip,
    Alert,
    Snackbar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Divider,
    Avatar,
} from "@mui/material";
import {
    ThumbUp,
    Edit,
    Delete,
    Person,
} from "@mui/icons-material";
import { useAuth } from "@/auth/context/useAuth";
import {
    createRating,
    getExamRatings,
    getRatingByUser,
    updateRating,
    deleteRating,
    markRatingAsHelpful,
    getRatingSummary,
    type ExamRating,
    type RatingSummary,
} from "@/exams/services/ratings.service";
import RatingDisplay from "./RatingDisplay";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Props {
    examId: string;
}

export default function RatingSection({ examId }: Props) {
    const { user } = useAuth();

    const [ratings, setRatings] = useState<ExamRating[]>([]);
    const [summary, setSummary] = useState<RatingSummary>({
        average: 0,
        count: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    });
    const [myRating, setMyRating] = useState<ExamRating | null>(null);

    // Form state
    const [ratingValue, setRatingValue] = useState<number>(0);
    const [comment, setComment] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    // UI state
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success" as "success" | "error",
    });
    const [deleteDialog, setDeleteDialog] = useState(false);

    useEffect(() => {
        loadRatings();
    }, [examId]);

    const loadRatings = async () => {
        try {
            const [allRatings, ratingSummary] = await Promise.all([
                getExamRatings(examId),
                getRatingSummary(examId),
            ]);

            setRatings(allRatings);
            setSummary(ratingSummary);

            // Verificar si el usuario ya calificó
            if (user) {
                const userRating = await getRatingByUser(examId, user.uid);
                setMyRating(userRating);

                if (userRating) {
                    setRatingValue(userRating.rating);
                    setComment(userRating.comment);
                }
            }
        } catch (error) {
            console.error("Error al cargar calificaciones:", error);
        }
    };

    const handleSubmit = async () => {
        if (!user) {
            setSnackbar({
                open: true,
                message: "Debes iniciar sesión para calificar",
                severity: "error",
            });
            return;
        }

        if (ratingValue === 0) {
            setSnackbar({
                open: true,
                message: "Selecciona una calificación",
                severity: "error",
            });
            return;
        }

        if (!comment.trim()) {
            setSnackbar({
                open: true,
                message: "Escribe un comentario",
                severity: "error",
            });
            return;
        }

        setLoading(true);

        try {
            if (myRating && isEditing) {
                // Actualizar calificación existente
                await updateRating(myRating.id, ratingValue, comment);
                setSnackbar({
                    open: true,
                    message: "Calificación actualizada correctamente",
                    severity: "success",
                });
            } else {
                // Crear nueva calificación
                await createRating(
                    examId,
                    user.uid,
                    user.displayName || user.email || "Usuario",
                    user.email || "",
                    ratingValue,
                    comment
                );
                setSnackbar({
                    open: true,
                    message: "Calificación publicada correctamente",
                    severity: "success",
                });
            }

            // Recargar calificaciones
            await loadRatings();
            setIsEditing(false);
        } catch (error: any) {
            setSnackbar({
                open: true,
                message: error.message || "Error al guardar calificación",
                severity: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        if (myRating) {
            setRatingValue(myRating.rating);
            setComment(myRating.comment);
        }
        setIsEditing(false);
    };

    const handleDelete = async () => {
        if (!myRating) return;

        try {
            await deleteRating(myRating.id);
            setSnackbar({
                open: true,
                message: "Calificación eliminada",
                severity: "success",
            });

            // Reset form
            setMyRating(null);
            setRatingValue(0);
            setComment("");
            setDeleteDialog(false);

            // Recargar calificaciones
            await loadRatings();
        } catch (error: any) {
            setSnackbar({
                open: true,
                message: error.message || "Error al eliminar calificación",
                severity: "error",
            });
        }
    };

    const handleHelpful = async (ratingId: string) => {
        if (!user) {
            setSnackbar({
                open: true,
                message: "Debes iniciar sesión",
                severity: "error",
            });
            return;
        }

        try {
            await markRatingAsHelpful(ratingId, user.uid);
            await loadRatings();
        } catch (error: any) {
            setSnackbar({
                open: true,
                message: error.message || "Error al marcar como útil",
                severity: "error",
            });
        }
    };

    const canEditOrDelete = myRating && !isEditing;
    const showForm = !myRating || isEditing;

    return (
        <Box>
            <Typography variant="h5" gutterBottom fontWeight="bold">
                Calificaciones y Opiniones
            </Typography>

            {/* Rating Summary */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <RatingDisplay summary={summary} />
                </CardContent>
            </Card>

            {/* Rating Form */}
            {user && (
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            {myRating ? "Tu Calificación" : "Califica este Examen"}
                        </Typography>

                        {canEditOrDelete && (
                            <Alert severity="info" sx={{ mb: 2 }}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Typography>
                                        Ya calificaste este examen ({myRating.rating} estrellas)
                                    </Typography>
                                    <Button
                                        size="small"
                                        startIcon={<Edit />}
                                        onClick={handleEdit}
                                    >
                                        Editar
                                    </Button>
                                    <Button
                                        size="small"
                                        color="error"
                                        startIcon={<Delete />}
                                        onClick={() => setDeleteDialog(true)}
                                    >
                                        Eliminar
                                    </Button>
                                </Stack>
                            </Alert>
                        )}

                        {showForm && (
                            <Box>
                                <Typography component="legend" gutterBottom>
                                    Tu calificación
                                </Typography>
                                <Rating
                                    value={ratingValue}
                                    onChange={(_, value) => setRatingValue(value || 0)}
                                    size="large"
                                    sx={{ mb: 2 }}
                                />

                                <TextField
                                    fullWidth
                                    multiline
                                    rows={4}
                                    label="Escribe tu opinión"
                                    placeholder="¿Qué te pareció este examen? ¿Te sirvió para estudiar?"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    sx={{ mb: 2 }}
                                />

                                <Stack direction="row" spacing={2}>
                                    <Button
                                        variant="contained"
                                        onClick={handleSubmit}
                                        disabled={loading || ratingValue === 0 || !comment.trim()}
                                    >
                                        {myRating ? "Actualizar Calificación" : "Publicar Calificación"}
                                    </Button>

                                    {isEditing && (
                                        <Button
                                            variant="outlined"
                                            onClick={handleCancelEdit}
                                            disabled={loading}
                                        >
                                            Cancelar
                                        </Button>
                                    )}
                                </Stack>
                            </Box>
                        )}
                    </CardContent>
                </Card>
            )}

            {!user && (
                <Alert severity="info" sx={{ mb: 3 }}>
                    Inicia sesión para calificar este examen
                </Alert>
            )}

            {/* Ratings List */}
            <Typography variant="h6" gutterBottom>
                Opiniones de la Comunidad ({ratings.length})
            </Typography>

            {ratings.length === 0 ? (
                <Alert severity="info">
                    Sé el primero en calificar este examen
                </Alert>
            ) : (
                <Stack spacing={2}>
                    {ratings.map((rating) => (
                        <Card key={rating.id}>
                            <CardContent>
                                <Stack direction="row" spacing={2} alignItems="flex-start">
                                    <Avatar>
                                        <Person />
                                    </Avatar>

                                    <Box flex={1}>
                                        <Stack
                                            direction="row"
                                            justifyContent="space-between"
                                            alignItems="center"
                                            mb={1}
                                        >
                                            <Box>
                                                <Typography variant="subtitle1" fontWeight="bold">
                                                    {rating.userName}
                                                </Typography>
                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    <Rating value={rating.rating} readOnly size="small" />
                                                    <Typography variant="caption" color="text.secondary">
                                                        {format(rating.createdAt, "dd 'de' MMMM, yyyy", {
                                                            locale: es,
                                                        })}
                                                    </Typography>
                                                    {rating.updatedAt && (
                                                        <Chip label="Editado" size="small" />
                                                    )}
                                                </Stack>
                                            </Box>
                                        </Stack>

                                        <Typography variant="body2" sx={{ mb: 2 }}>
                                            {rating.comment}
                                        </Typography>

                                        <Button
                                            size="small"
                                            startIcon={<ThumbUp />}
                                            onClick={() => handleHelpful(rating.id)}
                                            disabled={!user || rating.userId === user?.uid}
                                        >
                                            Útil ({rating.helpful})
                                        </Button>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    ))}
                </Stack>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
                <DialogTitle>¿Eliminar calificación?</DialogTitle>
                <DialogContent>
                    <Typography>
                        ¿Estás seguro de que quieres eliminar tu calificación? Esta acción no se puede deshacer.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog(false)}>Cancelar</Button>
                    <Button onClick={handleDelete} color="error" variant="contained">
                        Eliminar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}