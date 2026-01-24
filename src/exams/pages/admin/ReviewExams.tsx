import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Paper,
  Divider,
  Avatar,
  Alert,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import {
  CheckCircle,
  Cancel,
  Visibility,
  Download,
  Person,
  CalendarToday,
  School,
  Description,
} from "@mui/icons-material";

import Header from "../../components/Header";
import { PageContainer } from "../../components/PageContainer";
import {
  getAllExams,
  updateExamStatus,
  getExamDownloadURL,
  type Exam as ServiceExam,
} from "../../services/exams.service";

interface PendingExam {
  id: string;
  title: string;
  course?: string;
  teacher?: string;
  cycle?: string;
  uploadedBy?: string;
  uploadedByEmail?: string;
  uploadDate?: Date;
  fileSize?: number;
  description?: string;
  status: "pending" | "approved" | "rejected";
  filePath?: string;
  fileUrl?: string;
  fileName?: string;
}

export default function ReviewExams() {
  const [exams, setExams] = useState<PendingExam[]>([]);
  const [selectedExam, setSelectedExam] = useState<PendingExam | null>(null);
  const [openApproveDialog, setOpenApproveDialog] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchExams = async () => {
      try {
        const res: ServiceExam[] = await getAllExams({ status: "pending" });

        if (!mounted) return;

        const mapped: PendingExam[] = res.map((r) => ({
          id: r.id,
          title: r.title,
          course: r.course,
          teacher: r.teacher,
          cycle: r.cycle,
          uploadedBy: r.userId,
          uploadDate: r.uploadDate instanceof Date
            ? r.uploadDate
            : r.uploadDate
              ? new Date(r.uploadDate as string | number)
              : undefined,
          description: `${r.unit || ""}${r.section ? ` - ${r.section}` : ""}`,
          status: r.status,
          filePath: r.filePath,
          fileUrl: r.fileUrl,
          fileName: r.fileName,
        }));

        setExams(mapped);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchExams();

    return () => {
      mounted = false;
    };
  }, []);

  const handleApprove = (exam: PendingExam) => {
    setSelectedExam(exam);
    setOpenApproveDialog(true);
  };

  const handleReject = (exam: PendingExam) => {
    setSelectedExam(exam);
    setOpenRejectDialog(true);
  };

  const confirmApprove = () => {
    if (!selectedExam) return;
    updateExamStatus(selectedExam.id, "approved")
      .then(() => {
        setExams((prev) => prev.filter((e) => e.id !== selectedExam.id));
        setSnackbar({ open: true, message: `El examen fue "${selectedExam.title}" aprobado`, severity: "success" });
      })
      .catch((err) => {
        console.error(err);
        setSnackbar({ open: true, message: `Error al aprobar el examen`, severity: "error" });
      })
      .finally(() => {
        setOpenApproveDialog(false);
        setSelectedExam(null);
      });
  };

  const confirmReject = () => {
    if (!selectedExam) return;
    if (!rejectReason.trim()) return;
    updateExamStatus(selectedExam.id, "rejected")
      .then(() => {
        setExams((prev) => prev.filter((e) => e.id !== selectedExam.id));
        setSnackbar({ open: true, message: `El examen fue "${selectedExam.title}" rechazado`, severity: "error" });
        setRejectReason("");
      })
      .catch((err) => {
        console.error(err);
        setSnackbar({ open: true, message: `Error al rechazar el examen`, severity: "error" });
      })
      .finally(() => {
        setOpenRejectDialog(false);
        setSelectedExam(null);
      });
  };

  const handlePreview = async (exam: PendingExam) => {
    try {
      const url = exam.fileUrl || (exam.filePath ? await getExamDownloadURL(exam.filePath) : undefined);
      if (url) window.open(url, "_blank");
      else setSnackbar({ open: true, message: "No hay ninguna URL de archivo disponible", severity: "error" });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "Error al abrir el archivo", severity: "error" });
    }
  };

  const handleDownload = async (exam: PendingExam) => {
    try {
      const url = exam.fileUrl || (exam.filePath ? await getExamDownloadURL(exam.filePath) : undefined);
      if (!url) return setSnackbar({ open: true, message: "No hay ninguna URL de archivo disponible", severity: "error" });
      const a = document.createElement("a");
      a.href = url;
      a.download = exam.fileName || exam.title;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "Error al descargar el archivo", severity: "error" });
    }
  };

  const pendingCount = exams.filter((e) => e.status === "pending").length;

  if (loading) {
    return (
      <PageContainer>
        <Header title="Revisar Exámenes" subtitle="Revisa tus examenes pendientes por aprobar o rechazar" />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header title="Revisar Exámenes" subtitle="Revisa tus examenes pendientes por aprobar o rechazar" />

      <Box sx={{ mt: 3 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          Tienes <strong>{pendingCount}</strong> examen{pendingCount !== 1 ? "es" : ""} pendiente{pendingCount !== 1 ? "s" : ""} de revisión.
        </Alert>

        {exams.length === 0 ? (
          <Card>
            <CardContent sx={{ py: 8, textAlign: "center" }}>
              <CheckCircle sx={{ fontSize: 64, color: "success.main", mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Todo al día!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                No hay exámenes pendientes de revisión en este momento.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {exams.map((exam) => (
              <Grid size={{ xs: 12 }} key={exam.id}>
                <Card>
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12, md: 8 }}>
                        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                          <Avatar sx={{ bgcolor: "primary.main", width: 56, height: 56 }}>
                            <Description />
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" fontWeight={600} gutterBottom>
                              {exam.title}
                            </Typography>
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                              <Chip icon={<School />} label={exam.course} size="small" />
                              <Chip label={exam.teacher} size="small" variant="outlined" />
                              <Chip label={exam.cycle} size="small" variant="outlined" />
                            </Box>
                            <Typography variant="body2" color="text.secondary" paragraph>
                              {exam.description}
                            </Typography>
                            <Divider sx={{ my: 2 }} />
                            <Grid container spacing={2}>
                              <Grid size={{ xs: 12, sm: 6 }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                  <Person fontSize="small" color="action" />
                                  <Box>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                      Subido por
                                    </Typography>
                                    <Typography variant="body2" fontWeight={500}>
                                      {exam.uploadedBy}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {exam.uploadedByEmail}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Grid>
                              <Grid size={{ xs: 12, sm: 6 }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                  <CalendarToday fontSize="small" color="action" />
                                  <Box>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                      Fecha de subida
                                    </Typography>
                                    <Typography variant="body2" fontWeight={500}>
                                      {exam.uploadDate ? new Date(exam.uploadDate).toLocaleDateString() : ""}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      Tamaño del Archivo: {exam.fileSize}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Grid>
                            </Grid>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 2,
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            gap: 1.5,
                          }}
                        >
                          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                            Acciones
                          </Typography>
                          <Button variant="outlined" startIcon={<Visibility />} fullWidth onClick={() => handlePreview(exam)}>
                            Vista Previa
                          </Button>
                          <Button variant="outlined" startIcon={<Download />} fullWidth onClick={() => handleDownload(exam)}>
                            Descargar
                          </Button>
                          <Divider sx={{ my: 1 }} />
                          <Button variant="contained" color="success" startIcon={<CheckCircle />} fullWidth onClick={() => handleApprove(exam)}>
                            Aprobar
                          </Button>
                          <Button variant="contained" color="error" startIcon={<Cancel />} fullWidth onClick={() => handleReject(exam)}>
                            Rechazar
                          </Button>
                        </Paper>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        <Dialog open={openApproveDialog} onClose={() => setOpenApproveDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Aprobar Examen</DialogTitle>
          <DialogContent>
            <Typography variant="body1" gutterBottom>
              ¿Estás seguro de que quieres aprobar este examen?
            </Typography>
            {selectedExam && (
              <Paper variant="outlined" sx={{ p: 2, mt: 2, backgroundColor: "background.default" }}>
                <Typography variant="subtitle2" fontWeight={600}>
                  {selectedExam.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedExam.course}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                  Subido por: {selectedExam.uploadedBy}
                </Typography>
              </Paper>
            )}
            <Alert severity="success" sx={{ mt: 2 }}>
              Este examen será publicado y estará disponible para todos los estudiantes.
            </Alert>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenApproveDialog(false)}>Cancelar</Button>
            <Button variant="contained" color="success" onClick={confirmApprove}>
              Confirmar Aprobación
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={openRejectDialog} onClose={() => setOpenRejectDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Rechazar Examen</DialogTitle>
          <DialogContent>
            <Typography variant="body1" gutterBottom>
              Por favor, proporciona una razón para rechazar este examen:
            </Typography>
            {selectedExam && (
              <Paper variant="outlined" sx={{ p: 2, mt: 2, mb: 3, backgroundColor: "background.default" }}>
                <Typography variant="subtitle2" fontWeight={600}>
                  {selectedExam.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedExam.course}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                  Subido por: {selectedExam.uploadedBy}
                </Typography>
              </Paper>
            )}
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Rejection Reason"
              placeholder="Please explain why this exam is being rejected..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              required
              helperText="Este mensaje será enviado al estudiante que subió el examen"
            />
            <Alert severity="warning" sx={{ mt: 2 }}>
              El estudiante será notificado sobre el rechazo y podrá enviar una versión corregida.
            </Alert>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenRejectDialog(false)}>Cancel</Button>
            <Button variant="contained" color="error" onClick={confirmReject} disabled={!rejectReason.trim()}>
              Confirmar Rechazo
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </PageContainer>
  );
}