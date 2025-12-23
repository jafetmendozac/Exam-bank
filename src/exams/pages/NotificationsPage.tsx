import { useState, type JSX } from "react"
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Chip,
  List,
  Stack,
  Divider,
  Button,
  Menu,
  MenuItem,
} from "@mui/material"
import {
  CheckCircle,
  Cancel,
  Description,
  Favorite,
  Delete,
  MarkEmailRead,
  FilterList,
  Refresh,
} from "@mui/icons-material"


interface Notification {
  id: string
  type: "approved" | "rejected" | "new_exam" | "favorite"
  title: string
  message: string
  timestamp: string
  read: boolean
  examId?: string
  examTitle?: string
}

export default function NotificationsPage() {
  const [filterAnchor, setFilterAnchor] = useState<null | HTMLElement>(null)
  const [filter, setFilter] = useState<"all" | "unread">("all")

  const [notifications, setNotifications] = useState<Notification[]>([])

  const unreadCount = notifications.filter((n) => !n.read).length
  const filtered =
    filter === "unread"
      ? notifications.filter((n) => !n.read)
      : notifications

  const colorByType: Record<Notification["type"], string> = {
    approved: "success.main",
    rejected: "error.main",
    new_exam: "primary.main",
    favorite: "warning.main",
  }

  const iconByType: Record<Notification["type"], JSX.Element> = {
    approved: <CheckCircle />,
    rejected: <Cancel />,
    new_exam: <Description />,
    favorite: <Favorite />,
  }

  return (
      <Container maxWidth="md">
        {/* Header */}
        <Box
          sx={{
            mb: 4,
            p: 4,
            borderRadius: 3,
            background: "linear-gradient(135deg, #2563eb, #1e3a8a)",
            color: "white",
          }}
        >
          <Typography variant="h4" fontWeight={700}>
            Notificaciones
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {unreadCount > 0
              ? `Tienes ${unreadCount} notificación${
                  unreadCount > 1 ? "es" : ""
                } sin leer`
              : "No tienes notificaciones pendientes"}
          </Typography>
        </Box>

        {/* Actions */}
        <Stack direction="row" spacing={1} mb={3} flexWrap="wrap">
          <Button variant="outlined" size="small" startIcon={<Refresh />}>
            Actualizar
          </Button>

          <Button
            variant="outlined"
            size="small"
            startIcon={<FilterList />}
            onClick={(e) => setFilterAnchor(e.currentTarget)}
          >
            Filtrar
          </Button>

          {unreadCount > 0 && (
            <Button
              variant="contained"
              size="small"
              startIcon={<MarkEmailRead />}
              onClick={() =>
                setNotifications((prev) =>
                  prev.map((n) => ({ ...n, read: true }))
                )
              }
            >
              Marcar todo leído
            </Button>
          )}
        </Stack>

        {/* Filter menu */}
        <Menu
          anchorEl={filterAnchor}
          open={Boolean(filterAnchor)}
          onClose={() => setFilterAnchor(null)}
        >
          <MenuItem
            selected={filter === "all"}
            onClick={() => {
              setFilter("all")
              setFilterAnchor(null)
            }}
          >
            Todas
          </MenuItem>
          <MenuItem
            selected={filter === "unread"}
            onClick={() => {
              setFilter("unread")
              setFilterAnchor(null)
            }}
          >
            No leídas
          </MenuItem>
        </Menu>

        {/* Empty */}
        {filtered.length === 0 ? (
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ textAlign: "center", py: 8 }}>
              <Description sx={{ fontSize: 64, color: "text.disabled" }} />
              <Typography variant="h6" mt={2}>
                Sin notificaciones
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {filter === "unread"
                  ? "No tienes notificaciones sin leer"
                  : "Aquí aparecerán tus notificaciones"}
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <List sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {filtered.map((n) => (
              <Card
                key={n.id}
                sx={{
                  borderRadius: 3,
                  transition: "all .2s ease",
                  "&:hover": { boxShadow: 6 },
                  ...(n.read
                    ? {}
                    : {
                        backgroundColor: "action.hover",
                        borderLeft: "6px solid",
                        borderColor: "primary.main",
                      }),
                }}
              >
                <CardContent>
                  <Stack direction="row" spacing={2}>
                    <Avatar
                      sx={{
                        bgcolor: colorByType[n.type],
                        width: 52,
                        height: 52,
                      }}
                    >
                      {iconByType[n.type]}
                    </Avatar>

                    <Box flexGrow={1}>
                      <Stack direction="row" justifyContent="space-between">
                        <Box>
                          <Typography fontWeight={600}>
                            {n.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {n.timestamp}
                          </Typography>
                        </Box>

                        <Stack direction="row" spacing={1}>
                          {!n.read && (
                            <Chip
                              label="Nuevo"
                              size="small"
                              color="primary"
                            />
                          )}
                          <IconButton size="small">
                            <Delete fontSize="small" />
                          </IconButton>
                        </Stack>
                      </Stack>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        mt={1}
                      >
                        {n.message}
                      </Typography>

                      {n.examTitle && (
                        <Chip
                          icon={<Description />}
                          label={n.examTitle}
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      )}

                      <Divider sx={{ my: 1.5 }} />

                      <Stack direction="row" spacing={1}>
                        {n.examId && (
                          <Button size="small" variant="outlined">
                            Ver examen
                          </Button>
                        )}
                        {!n.read && (
                          <Button
                            size="small"
                            onClick={() =>
                              setNotifications((prev) =>
                                prev.map((x) =>
                                  x.id === n.id
                                    ? { ...x, read: true }
                                    : x
                                )
                              )
                            }
                          >
                            Marcar leído
                          </Button>
                        )}
                      </Stack>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </List>
        )}
      </Container>
  )
}
