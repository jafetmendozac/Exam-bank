// import {
//   AppBar,
//   Toolbar,
//   Container,
//   Box,
//   Typography,
//   Button,
//   IconButton,
//   Avatar,
// } from "@mui/material";
// import MenuIcon from "@mui/icons-material/Menu";
// import LogoutIcon from "@mui/icons-material/Logout";
// import { Outlet, Link, useNavigate } from "react-router-dom";
// import { signOut } from "firebase/auth";
// import { auth } from "@/app/firebase";
// import { useAuth } from "@/auth/context/useAuth";

// export const AppLayout = () => {
//   const { user, role } = useAuth();
//   const navigate = useNavigate();

//   const logout = async () => {
//     await signOut(auth);
//     navigate("/login");
//   };

//   return (
//     <>
//       <AppBar
//         position="sticky"
//         color="default"
//         elevation={1}
//         sx={{ borderBottom: 1, borderColor: "divider" }}
//       >
//         <Container maxWidth="lg">
//           <Toolbar disableGutters sx={{ height: 64 }}>
//             {/* LEFT — LOGO */}
//             <Box display="flex" alignItems="center" flexGrow={1}>
//               <Box
//                 sx={{
//                   width: 32,
//                   height: 32,
//                   bgcolor: "primary.main",
//                   borderRadius: 1,
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   mr: 1.5,
//                 }}
//               >
//                 📘
//               </Box>
//               <Typography
//                 variant="h6"
//                 component={Link}
//                 to="/exams"
//                 sx={{
//                   textDecoration: "none",
//                   color: "text.primary",
//                   fontWeight: 600,
//                 }}
//               >
//                 ExamHub
//               </Typography>
//             </Box>

//             <Box
//               sx={{
//                 display: { xs: "none", md: "flex" },
//                 gap: 1,
//                 mr: 4,
//               }}
//             >
//               <Button component={Link} to="/exams">
//                 Dashboard
//               </Button>

//               <Button component={Link} to="/exams">
//                 Exámenes
//               </Button>

//               {role === "admin" && (
//                 <Button component={Link} to="/upload">
//                   Subir Examen
//                 </Button>
//               )}

//               {role === "admin" && (
//                 <Button component={Link} to="/admin">
//                   Admin Panel
//                 </Button>
//               )}
//             </Box>

//             <Box display="flex" alignItems="center" gap={1}>
//               <Avatar sx={{ width: 32, height: 32 }}>
//                 {user?.email?.[0].toUpperCase()}
//               </Avatar>

//               <IconButton color="error" onClick={logout}>
//                 <LogoutIcon />
//               </IconButton>

//               <IconButton sx={{ display: { md: "none" } }}>
//                 <MenuIcon />
//               </IconButton>
//             </Box>
//           </Toolbar>
//         </Container>
//       </AppBar>

//       <Outlet />
//     </>
//   );
// };



import type React from "react"
import { useState } from "react"
import { useNavigate, useLocation, Outlet } from "react-router-dom"

import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
  Badge,
} from "@mui/material"

import {
  Menu as MenuIcon,
  Dashboard,
  Description,
  Upload,
  AdminPanelSettings,
  School,
  Logout,
  Settings,
  Person,
  // Brightness4,
  // Brightness7,
  ReportProblem,
  Favorite,
  CloudUpload,
  RateReview,
  HelpOutline,
  Notifications,
} from "@mui/icons-material"

// import { useColorMode } from "@/providers/ColorModeProvider"

const drawerWidth = 260

export default function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  // const { toggleColorMode, mode } = useColorMode()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const notificationCount = 2

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen)
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget)
  const handleMenuClose = () => setAnchorEl(null)

  const handleProfile = () => {
    handleMenuClose()
    navigate("/profile")
  }

  const handleLogout = () => {
    handleMenuClose()
    navigate("/login")
  }

  const menuItems = [
    { text: "Dashboard", icon: <Dashboard />, path: "/dashboard" },
    { text: "Browse Exams", icon: <Description />, path: "/exams" },
    { text: "Upload Exam", icon: <Upload />, path: "/upload" },
    { text: "My Exams", icon: <CloudUpload />, path: "/my-exams" },
    { text: "Favorites", icon: <Favorite />, path: "/favorites" },
    { text: "Report Issue", icon: <ReportProblem />, path: "/report" },
    { text: "Help & FAQ", icon: <HelpOutline />, path: "/help" },
    { text: "Notifications", icon: <Notifications />, path: "/notifications", badge: notificationCount },
    { text: "Admin Panel", icon: <AdminPanelSettings />, path: "/admin" },
    { text: "Review Exams", icon: <RateReview />, path: "/admin/review-exams" },
  ]

  const drawer = (
    <Box>
      <Toolbar sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 3 }}>
        <School sx={{ fontSize: 32, color: "primary.main" }} />
        <Typography variant="h6" fontWeight={700} color="primary">
          Exam Bank
        </Typography>
      </Toolbar>

      <Divider />

      <List sx={{ px: 2, py: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path)
                if (isMobile) setMobileOpen(false)
              }}
              sx={{
                borderRadius: 2,
                "&.Mui-selected": {
                  backgroundColor: "primary.main",
                  color: "white",
                  "&:hover": { backgroundColor: "primary.dark" },
                  "& .MuiListItemIcon-root": { color: "white" },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.badge ? (
                  <Badge badgeContent={item.badge} color="error">
                    {item.icon}
                  </Badge>
                ) : (
                  item.icon
                )}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  )

  return (
    <Box sx={{ display: "flex" }}>
      {/* APP BAR */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          backgroundColor: theme.palette.mode === "light" ? "white" : "background.paper",
          color: "text.primary",
          boxShadow: "0 1px 3px rgb(0 0 0 / 0.1)",
        }}
      >
        <Toolbar>
          <IconButton edge="start" onClick={handleDrawerToggle} sx={{ mr: 2, display: { md: "none" } }}>
            <MenuIcon />
          </IconButton>

          <Box sx={{ flexGrow: 1 }} />

          <IconButton sx={{ mr: 1 }} onClick={() => navigate("/notifications")}>
            <Badge badgeContent={notificationCount} color="error">
              <Notifications />
            </Badge>
          </IconButton>

          {/* <IconButton onClick={toggleColorMode} sx={{ mr: 1 }}>
            {mode === "dark" ? <Brightness7 /> : <Brightness4 />}
          </IconButton> */}

          <IconButton onClick={handleMenuOpen}>
            <Avatar sx={{ width: 36, height: 36, bgcolor: "primary.main" }}>
              <Person />
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
          >
            <MenuItem onClick={handleProfile}>
              <ListItemIcon>
                <Person fontSize="small" />
              </ListItemIcon>
              Profile
            </MenuItem>

            <MenuItem onClick={handleMenuClose}>
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              Settings
            </MenuItem>

            <Divider />

            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* DRAWER */}
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": { width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>

        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": { width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* MAIN CONTENT */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: "100vh",
          backgroundColor: "background.default",
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>

  )
}
