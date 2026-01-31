import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
} from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import DownloadIcon from "@mui/icons-material/Download";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
// import { useAuth } from "@/auth/context/useAuth";
import { Button } from "@mui/material";
import Header from "../components/Header";
import { PageContainer } from "../components/PageContainer";
import { useEffect, useState } from "react";
import { useAuth } from "@/auth/context/useAuth";
import {
  getTotalExamsCount,
  getThisMonthExamsCount,
  getUserUploadsCount,
  getUserDownloadsCount,
  getActiveUsersCount,
  getRecentExams,
} from "../services/dashboard.service";


const DashboardPage = () => {
  const { user } = useAuth();

  const [availableExams, setAvailableExams] = useState<number | null>(null);
  const [thisMonthExams, setThisMonthExams] = useState<number | null>(null);
  const [yourUploads, setYourUploads] = useState<number | null>(null);
  const [yourDownloads, setYourDownloads] = useState<number | null>(null);
  const [activeUsers, setActiveUsers] = useState<number | null>(null);
  const [recentExamsList, setRecentExamsList] = useState<any[]>([]);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const [total, month, usersCount, recent] = await Promise.all([
          getTotalExamsCount(),
          getThisMonthExamsCount(),
          getActiveUsersCount(),
          getRecentExams(5),
        ]);

        setAvailableExams(total);
        setThisMonthExams(month);
        setActiveUsers(usersCount);
        setRecentExamsList(recent);

        if (user?.uid) {
          const [uploads, downloads] = await Promise.all([
            getUserUploadsCount(user.uid),
            getUserDownloadsCount(user.uid),
          ]);
          setYourUploads(uploads);
          setYourDownloads(downloads);
        }
      } catch (err) {
        console.error("Error loading dashboard metrics", err);
      }
    };

    loadMetrics();
  }, [user]);
  // const { role } = useAuth();

  return (
    <PageContainer>

      <Header 
        title="Mi Dashboard" 
        subtitle="Accede a todos los exámenes disponibles"
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center">
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: "50%",
                    bgcolor: "primary.light",
                    color: "primary.main",
                  }}
                >
                  <DescriptionIcon />
                </Box>

                <Box ml={2}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    fontWeight={500}
                  >
                    Exámenes totales
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {availableExams ?? "..."}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center">
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: "50%",
                    bgcolor: "secondary.light",
                    color: "secondary.main",
                  }}
                >
                  <DownloadIcon />
                </Box>

                <Box ml={2}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    fontWeight={500}
                  >
                    Tus descargas
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {yourDownloads ?? "..."}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* ÚLTIMOS 7 DÍAS */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center">
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: "50%",
                    bgcolor: "success.light",
                    color: "success.main",
                  }}
                >
                  <AccessTimeIcon />
                </Box>

                <Box ml={2}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    fontWeight={500}
                  >
                    Este mes
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {thisMonthExams ?? "..."}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} mt={2}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Exámenes añadidos recientemente
              </Typography>
              {recentExamsList.map((ex) => (
                <Box key={ex.id} sx={{ pb: 2, borderBottom: "1px solid", borderColor: "divider", mb: 2 }}>
                  <Typography fontWeight={600}>{ex.title}</Typography>
                  <Stack direction="row" spacing={1} mt={1}>
                    <Typography variant="caption" color="text.secondary">{ex.course}</Typography>
                    <Typography variant="caption" color="text.secondary">{ex.teacher}</Typography>
                    <Typography variant="caption" color="text.secondary">{new Date(ex.uploadDate).toLocaleDateString()}</Typography>
                  </Stack>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Acciones rápidas
              </Typography>
              <Stack spacing={2}>
                <Button variant="contained">Subir examen</Button>
                <Button variant="outlined">Explorar exámenes</Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
          {/* {role === "admin" && (
      <Button variant="contained">Subir Profesores</Button>
    )}
    {role} */}
    </PageContainer>
  );
};

export default DashboardPage;
