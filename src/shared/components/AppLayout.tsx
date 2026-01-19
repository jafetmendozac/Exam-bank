import type React from "react"
import { useState, type ReactNode } from "react"
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
  Brightness4,
  Brightness7,
  ReportProblem,
  Favorite,
  CloudUpload,
  RateReview,
  HelpOutline,
  Notifications,
} from "@mui/icons-material"
import { useColorMode } from "@/app/theme/ColorModeContext"
import { auth } from "@/app/firebase"
import { signOut } from "firebase/auth"
import { useAuth } from "@/auth/context/useAuth"


export interface MenuItem {
  text: string
  icon: ReactNode
  path: string
  badge?: number
}

const drawerWidth = 260


export default function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const { toggleColorMode, mode } = useColorMode()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const { role } = useAuth()

  const notificationCount = 2

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen)
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget)
  const handleMenuClose = () => setAnchorEl(null)

  const handleProfile = () => {
    handleMenuClose()
    navigate("/profile")
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      handleMenuClose()
      navigate("/login", { replace: true })
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }


  const commonMenuItems: MenuItem[] = [
    { text: "Panel", icon: <Dashboard />, path: "/dashboard" },
    { text: "Examenes", icon: <Description />, path: "/exams" },
    { text: "Favoritos", icon: <Favorite />, path: "/favorites" },
    { text: "Notificaciones", icon: <Notifications />, path: "/notifications", badge: notificationCount },
    { text: "Ayuda", icon: <HelpOutline />, path: "/help" },
  ]

  const userMenuItems: MenuItem[] = [
    { text: "Subir Examen", icon: <Upload />, path: "/upload" },
    { text: "Mis Examenes", icon: <CloudUpload />, path: "/my-exams" },
    { text: "Reportar", icon: <ReportProblem />, path: "/report" }
  ]

  const adminMenuItems: MenuItem[] = [
    { text: "Panel Administrador", icon: <AdminPanelSettings />, path: "/admin" },
    { text: "Revisar Examenes", icon: <RateReview />, path: "/admin/review-exams" },
  ]
  const menuItems: MenuItem[] = [
    ...commonMenuItems,
    ...(role === "alumno" || role === "admin" ? userMenuItems : []),
    ...(role === "admin" ? adminMenuItems : []),
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

          <IconButton onClick={toggleColorMode} sx={{ mr: 1 }}>
            {mode === "dark" ? <Brightness7 /> : <Brightness4 />}
          </IconButton>

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
