import { useNavigate, useLocation, Outlet } from "react-router-dom";
import {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    Divider,
    Avatar,
    Stack,
    useTheme,
    alpha,
    Badge,
} from "@mui/material";
import {
    Dashboard,
    Assignment,
    RateReview,
    People,
    BarChart,
    Settings,
    HelpOutline,
    ContactSupport,
    ExitToApp,
    CloudUpload,
} from "@mui/icons-material";

const adminDrawerWidth = 240;

interface AdminMenuItem {
    text: string;
    icon: React.ReactNode;
    path: string;
    divider?: boolean;
    badge?: number;
}

export default function AdminLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();

    const adminMenuItems: AdminMenuItem[] = [
        { text: "Overview", icon: <Dashboard />, path: "/admin" },
        { text: "Revisar Exámenes", icon: <RateReview />, path: "/admin/review-exams" },
        { text: "Subir Examen", icon: <CloudUpload />, path: "/upload" },
        { text: "Gestión", icon: <Assignment />, path: "/admin/manage" },
        { text: "Usuarios", icon: <People />, path: "/admin/users" },
        { text: "Estadísticas", icon: <BarChart />, path: "/admin/stats" },
        { text: "Configuración", icon: <Settings />, path: "/admin/settings", divider: true },
        { text: "Ayuda", icon: <HelpOutline />, path: "/help" },
        { text: "Contacto", icon: <ContactSupport />, path: "/admin/contact" },
    ];

    const isActive = (path: string) => {
        if (path === "/admin") {
            return location.pathname === "/admin";
        }
        return location.pathname.startsWith(path);
    };

    const drawer = (
        <Box
            sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                bgcolor: "#1a1a2e",
                color: "white",
            }}
        >
            {/* Logo/Header */}
            <Box sx={{ p: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                        sx={{
                            bgcolor: alpha("#ffffff", 0.1),
                            width: 40,
                            height: 40,
                        }}
                    >
                        @
                    </Avatar>
                    <Box>
                        <Typography variant="body1" fontWeight={700}>
                            Admin Panel
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.7 }}>
                            Exam Bank
                        </Typography>
                    </Box>
                </Stack>
            </Box>

            <Divider sx={{ borderColor: alpha("#ffffff", 0.1) }} />

            {/* Navigation */}
            <List sx={{ px: 2, py: 2, flexGrow: 1 }}>
                {adminMenuItems.map((item) => (
                    <Box key={item.text}>
                        {item.divider && (
                            <Divider sx={{ my: 2, borderColor: alpha("#ffffff", 0.1) }} />
                        )}
                        <ListItem disablePadding sx={{ mb: 0.5 }}>
                            <ListItemButton
                                selected={isActive(item.path)}
                                onClick={() => navigate(item.path)}
                                sx={{
                                    borderRadius: 2,
                                    color: "white",
                                    "&:hover": {
                                        bgcolor: alpha("#ffffff", 0.08),
                                    },
                                    "&.Mui-selected": {
                                        bgcolor: alpha("#ffffff", 0.15),
                                        "&:hover": {
                                            bgcolor: alpha("#ffffff", 0.2),
                                        },
                                    },
                                }}
                            >
                                <ListItemIcon sx={{ color: "white", minWidth: 40 }}>
                                    {item.badge ? (
                                        <Badge badgeContent={item.badge} color="error">
                                            {item.icon}
                                        </Badge>
                                    ) : (
                                        item.icon
                                    )}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.text}
                                    primaryTypographyProps={{
                                        fontSize: "0.9rem",
                                        fontWeight: isActive(item.path) ? 600 : 400,
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    </Box>
                ))}
            </List>

            {/* Footer */}
            <Box sx={{ p: 2 }}>
                <Divider sx={{ mb: 2, borderColor: alpha("#ffffff", 0.1) }} />
                <ListItem disablePadding>
                    <ListItemButton
                        onClick={() => navigate("/dashboard")}
                        sx={{
                            borderRadius: 2,
                            color: "white",
                            "&:hover": {
                                bgcolor: alpha("#ffffff", 0.08),
                            },
                        }}
                    >
                        <ListItemIcon sx={{ color: "white", minWidth: 40 }}>
                            <ExitToApp />
                        </ListItemIcon>
                        <ListItemText
                            primary="Salir del Admin"
                            primaryTypographyProps={{ fontSize: "0.9rem" }}
                        />
                    </ListItemButton>
                </ListItem>
            </Box>
        </Box>
    );

    return (
        <Box
            sx={{
                display: "flex",
                height: "100vh",
                width: "100vw",
                position: "fixed",
                top: 0,
                left: 0,
                overflow: "hidden",
                bgcolor: theme.palette.mode === "light" ? "#f5f5f7" : "background.default",
            }}
        >
            {/* Admin Sidebar */}
            <Drawer
                variant="permanent"
                sx={{
                    width: adminDrawerWidth,
                    flexShrink: 0,
                    "& .MuiDrawer-paper": {
                        width: adminDrawerWidth,
                        boxSizing: "border-box",
                        border: "none",
                        position: "fixed",
                        height: "100vh",
                        zIndex: 1200,
                    },
                }}
            >
                {drawer}
            </Drawer>

            {/* Admin Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    marginLeft: `${adminDrawerWidth}px`,
                    height: "100vh",
                    overflow: "auto",
                    bgcolor: theme.palette.mode === "light" ? "#f5f5f7" : "background.default",
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
}