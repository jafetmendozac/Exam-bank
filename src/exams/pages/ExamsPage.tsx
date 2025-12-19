import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
} from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import DownloadIcon from "@mui/icons-material/Download";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useAuth } from "@/auth/context/useAuth";
import { Button } from "@mui/material";


const ExamsPage = () => {
  // Estos luego vendrán de Firestore
  const availableExams = 24;
  const selectedExams = [];
  const recentExams = 6;
  const { role } = useAuth();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>

      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold">
          Mi Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" mt={1}>
          Accede a todos los exámenes disponibles
        </Typography>
      </Box>

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
                    Disponibles
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {availableExams}
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
                    Seleccionados
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {selectedExams.length}
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
                    Últimos 7 días
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {recentExams}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
          {role === "admin" && (
      <Button variant="contained">Subir examen</Button>
    )}
    {role}
    </Container>
  );
};

export default ExamsPage;
