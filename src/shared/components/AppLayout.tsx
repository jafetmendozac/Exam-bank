import {
  AppBar,
  Toolbar,
  Container,
  Box,
  Typography,
  Button,
  IconButton,
  Avatar,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "@/app/firebase";
import { useAuth } from "@/auth/context/useAuth";

export const AppLayout = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const logout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <>
      <AppBar
        position="sticky"
        color="default"
        elevation={1}
        sx={{ borderBottom: 1, borderColor: "divider" }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ height: 64 }}>
            {/* LEFT — LOGO */}
            <Box display="flex" alignItems="center" flexGrow={1}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: "primary.main",
                  borderRadius: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mr: 1.5,
                }}
              >
                📘
              </Box>
              <Typography
                variant="h6"
                component={Link}
                to="/exams"
                sx={{
                  textDecoration: "none",
                  color: "text.primary",
                  fontWeight: 600,
                }}
              >
                ExamHub
              </Typography>
            </Box>

            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                gap: 1,
                mr: 4,
              }}
            >
              <Button component={Link} to="/exams">
                Dashboard
              </Button>

              <Button component={Link} to="/exams">
                Exámenes
              </Button>

              {role === "admin" && (
                <Button component={Link} to="/upload">
                  Subir Examen
                </Button>
              )}

              {role === "admin" && (
                <Button component={Link} to="/admin">
                  Admin Panel
                </Button>
              )}
            </Box>

            <Box display="flex" alignItems="center" gap={1}>
              <Avatar sx={{ width: 32, height: 32 }}>
                {user?.email?.[0].toUpperCase()}
              </Avatar>

              <IconButton color="error" onClick={logout}>
                <LogoutIcon />
              </IconButton>

              <IconButton sx={{ display: { md: "none" } }}>
                <MenuIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Outlet />
    </>
  );
};
