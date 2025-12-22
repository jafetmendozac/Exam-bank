import { useState, type SyntheticEvent } from "react"
import Header from '../components/Header';
import {
  Box,
  Typography,
  Container,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Divider,
} from "@mui/material"
import {
  ExpandMore,
  CheckCircle,
  Cancel,
  Search,
} from "@mui/icons-material"

export default function HelpPage() {
  const [expanded, setExpanded] = useState<string | false>("panel1")

  const handleChange =
    (panel: string) => (_event: SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false)
    }

  return (
    <Container maxWidth="lg">

      <Header 
        title="Ayuda y Preguntas Frecuentes" 
        subtitle="Todo lo que necesitas saber para usar el banco de exámenes"
      />

      <Grid container spacing={4}>
        {/* FAQ */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: 2,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography fontWeight={600} sx={{ mb: 2 }}>
                Preguntas frecuentes
              </Typography>

              {faqs.map((faq) => (
                <Accordion
                  key={faq.id}
                  expanded={expanded === faq.id}
                  onChange={handleChange(faq.id)}
                  disableGutters
                  sx={{
                    mb: 1.5,
                    borderRadius: 2,
                    "&:before": { display: "none" },
                    boxShadow: 0,
                    border: "1px solid",
                    borderColor: "divider",
                    "&.Mui-expanded": {
                      backgroundColor: "action.hover",
                    },
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography fontWeight={600}>
                      {faq.question}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>{faq.answer}</AccordionDetails>
                </Accordion>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: 2,
              position: "sticky",
              top: 24,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography fontWeight={600}>
                Reglas del sistema
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {rules.map((rule, i) => (
                  <Box
                    key={i}
                    sx={{
                      display: "flex",
                      gap: 1.5,
                      alignItems: "flex-start",
                    }}
                  >
                    {rule.icon}
                    <Box>
                      <Typography fontWeight={600} variant="body2">
                        {rule.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        {rule.description}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>

              <Alert
                severity="info"
                sx={{ mt: 3, borderRadius: 2 }}
              >
                Esta plataforma es una iniciativa estudiantil, no oficial.
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  )
}

/* -------- DATA -------- */

const faqs = [
  {
    id: "panel1",
    question: "¿Cómo subo un examen?",
    answer: (
      <>
        <Typography paragraph>
          Para subir un examen, sigue estos pasos:
        </Typography>
        <List dense>
          {[
            "Ve a la sección 'Upload Exam'",
            "Completa todos los datos requeridos",
            "Sube el archivo PDF (máx. 10MB)",
            "El examen será revisado por administradores",
          ].map((text, i) => (
            <ListItem key={i}>
              <ListItemIcon>
                <CheckCircle color="success" />
              </ListItemIcon>
              <ListItemText primary={text} />
            </ListItem>
          ))}
        </List>
      </>
    ),
  },
  {
    id: "panel2",
    question: "¿Qué formato de archivo acepta la plataforma?",
    answer: (
      <Typography>
        Solo se aceptan archivos <strong>PDF</strong> de hasta{" "}
        <strong>10MB</strong>.
      </Typography>
    ),
  },
  {
    id: "panel3",
    question: "¿Cuánto tiempo tarda la aprobación?",
    answer: (
      <Typography>
        Entre <strong>24 y 48 horas</strong>.
      </Typography>
    ),
  },
  {
    id: "panel4",
    question: "¿Puedo editar o eliminar un examen?",
    answer: (
      <Typography>
        Sí, desde <strong>My Exams</strong>. Los cambios requieren
        nueva revisión.
      </Typography>
    ),
  },
  {
    id: "panel5",
    question: "¿Cómo busco un examen?",
    answer: (
      <List dense>
        {[
          "Buscar por curso o código",
          "Filtrar por ciclo o profesor",
        ].map((text, i) => (
          <ListItem key={i}>
            <ListItemIcon>
              <Search color="primary" />
            </ListItemIcon>
            <ListItemText primary={text} />
          </ListItem>
        ))}
      </List>
    ),
  },
  {
    id: "panel6",
    question: "¿Puedo descargar los exámenes?",
    answer: (
      <Typography>
        Sí, todos los exámenes aprobados están disponibles en PDF.
      </Typography>
    ),
  },
]

const rules = [
  {
    icon: <CheckCircle color="success" />,
    title: "Contenido apropiado",
    description: "Solo exámenes legítimos.",
  },
  {
    icon: <Cancel color="error" />,
    title: "No plagio",
    description: "No subas contenido sin permiso.",
  },
]
