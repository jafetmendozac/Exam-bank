import { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Card,
    CardContent,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Paper,
    Chip,
    IconButton,
    Button,
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    Snackbar,
    CircularProgress,
    Avatar,
    Menu,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Tooltip,
} from "@mui/material";
import {
    MoreVert,
    Search,
    Block,
    CheckCircle,
    AdminPanelSettings,
    Person,
    Delete,
    Refresh,
    Info,
} from "@mui/icons-material";
import {
    getAllUsers,
    getUserStats,
    updateUserRole,
    updateUserStatus,
    deleteUserDocument,
    type UserProfile,
    type UserStats,
} from "@/auth/services/users.service";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function UsersPage() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState<"all" | "user" | "admin">("all");
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "banned">("all");

    // Pagination
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Selected user
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [userStats, setUserStats] = useState<UserStats | null>(null);

    // Dialogs
    const [detailsDialog, setDetailsDialog] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState(false);
    const [confirmAction, setConfirmAction] = useState<{
        type: "role" | "ban" | "unban" | "delete";
        user: UserProfile | null;
        newValue?: string;
    }>({ type: "role", user: null });

    // Menu
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [menuUser, setMenuUser] = useState<UserProfile | null>(null);

    // Snackbar
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success" as "success" | "error",
    });

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [searchTerm, roleFilter, statusFilter, users]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const allUsers = await getAllUsers();
            setUsers(allUsers);
            setFilteredUsers(allUsers);
        } catch (error) {
            console.error("Error al cargar usuarios:", error);
            setSnackbar({
                open: true,
                message: "Error al cargar usuarios",
                severity: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...users];

        // Search filter
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (user) =>
                    user.email.toLowerCase().includes(term) ||
                    (user.displayName?.toLowerCase() || "").includes(term)
            );
        }

        // Role filter
        if (roleFilter !== "all") {
            filtered = filtered.filter((user) => user.role === roleFilter);
        }

        // Status filter
        if (statusFilter !== "all") {
            filtered = filtered.filter((user) => user.status === statusFilter);
        }

        setFilteredUsers(filtered);
        setPage(0); // Reset to first page
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, user: UserProfile) => {
        setAnchorEl(event.currentTarget);
        setMenuUser(user);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setMenuUser(null);
    };

    const handleViewDetails = async (user: UserProfile) => {
        setSelectedUser(user);
        setDetailsDialog(true);

        // Load stats
        try {
            const stats = await getUserStats(user.uid);
            setUserStats(stats);
        } catch (error) {
            console.error("Error al cargar stats:", error);
        }
    };

    const handleChangeRole = (user: UserProfile, newRole: "user" | "admin") => {
        setConfirmAction({ type: "role", user, newValue: newRole });
        setConfirmDialog(true);
        handleMenuClose();
    };

    const handleBanUser = (user: UserProfile) => {
        setConfirmAction({
            type: user.status === "active" ? "ban" : "unban",
            user,
        });
        setConfirmDialog(true);
        handleMenuClose();
    };

    const handleDeleteUser = (user: UserProfile) => {
        setConfirmAction({ type: "delete", user });
        setConfirmDialog(true);
        handleMenuClose();
    };

    const executeAction = async () => {
        if (!confirmAction.user) return;

        try {
            switch (confirmAction.type) {
                case "role":
                    await updateUserRole(
                        confirmAction.user.uid,
                        confirmAction.newValue as "user" | "admin"
                    );
                    setSnackbar({
                        open: true,
                        message: `Rol actualizado a ${confirmAction.newValue}`,
                        severity: "success",
                    });
                    break;

                case "ban":
                    await updateUserStatus(confirmAction.user.uid, "banned");
                    setSnackbar({
                        open: true,
                        message: "Usuario baneado",
                        severity: "success",
                    });
                    break;

                case "unban":
                    await updateUserStatus(confirmAction.user.uid, "active");
                    setSnackbar({
                        open: true,
                        message: "Usuario desbaneado",
                        severity: "success",
                    });
                    break;

                case "delete":
                    await deleteUserDocument(confirmAction.user.uid);
                    setSnackbar({
                        open: true,
                        message: "Usuario eliminado de Firestore",
                        severity: "success",
                    });
                    break;
            }

            // Reload users
            await loadUsers();
            setConfirmDialog(false);
        } catch (error: any) {
            console.error("Error al ejecutar acción:", error);
            setSnackbar({
                open: true,
                message: error.message || "Error al ejecutar acción",
                severity: "error",
            });
        }
    };

    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const paginatedUsers = filteredUsers.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            {/* Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight="bold">
                    Gestión de Usuarios
                </Typography>
                <Button startIcon={<Refresh />} onClick={loadUsers}>
                    Recargar
                </Button>
            </Stack>

            {/* Stats Summary */}
            <Stack direction="row" spacing={2} mb={3}>
                <Card sx={{ flex: 1 }}>
                    <CardContent>
                        <Typography variant="h3" fontWeight="bold">
                            {users.length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Total Usuarios
                        </Typography>
                    </CardContent>
                </Card>

                <Card sx={{ flex: 1 }}>
                    <CardContent>
                        <Typography variant="h3" fontWeight="bold">
                            {users.filter((u) => u.role === "admin").length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Administradores
                        </Typography>
                    </CardContent>
                </Card>

                <Card sx={{ flex: 1 }}>
                    <CardContent>
                        <Typography variant="h3" fontWeight="bold">
                            {users.filter((u) => u.status === "active").length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Usuarios Activos
                        </Typography>
                    </CardContent>
                </Card>

                <Card sx={{ flex: 1 }}>
                    <CardContent>
                        <Typography variant="h3" fontWeight="bold" color="error">
                            {users.filter((u) => u.status === "banned").length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Usuarios Baneados
                        </Typography>
                    </CardContent>
                </Card>
            </Stack>

            {/* Filters */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <TextField
                            placeholder="Buscar por email o nombre..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: <Search sx={{ mr: 1, color: "text.secondary" }} />,
                            }}
                            sx={{ flex: 1 }}
                        />

                        <FormControl sx={{ minWidth: 150 }}>
                            <InputLabel>Rol</InputLabel>
                            <Select
                                value={roleFilter}
                                label="Rol"
                                onChange={(e) => setRoleFilter(e.target.value as any)}
                            >
                                <MenuItem value="all">Todos</MenuItem>
                                <MenuItem value="user">Usuario</MenuItem>
                                <MenuItem value="admin">Admin</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl sx={{ minWidth: 150 }}>
                            <InputLabel>Estado</InputLabel>
                            <Select
                                value={statusFilter}
                                label="Estado"
                                onChange={(e) => setStatusFilter(e.target.value as any)}
                            >
                                <MenuItem value="all">Todos</MenuItem>
                                <MenuItem value="active">Activo</MenuItem>
                                <MenuItem value="banned">Baneado</MenuItem>
                            </Select>
                        </FormControl>
                    </Stack>
                </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Usuario</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Rol</TableCell>
                                <TableCell>Estado</TableCell>
                                <TableCell>Registro</TableCell>
                                <TableCell>Último Login</TableCell>
                                <TableCell align="right">Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        <Typography variant="body2" color="text.secondary" py={4}>
                                            No se encontraron usuarios
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedUsers.map((user) => (
                                    <TableRow key={user.uid} hover>
                                        <TableCell>
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                <Avatar src={user.photoURL}>
                                                    <Person />
                                                </Avatar>
                                                <Typography variant="body2">
                                                    {user.displayName || "Sin nombre"}
                                                </Typography>
                                            </Stack>
                                        </TableCell>

                                        <TableCell>
                                            <Typography variant="body2">{user.email}</Typography>
                                        </TableCell>

                                        <TableCell>
                                            <Chip
                                                label={user.role}
                                                color={user.role === "admin" ? "primary" : "default"}
                                                size="small"
                                                icon={
                                                    user.role === "admin" ? (
                                                        <AdminPanelSettings />
                                                    ) : (
                                                        <Person />
                                                    )
                                                }
                                            />
                                        </TableCell>

                                        <TableCell>
                                            <Chip
                                                label={user.status}
                                                color={user.status === "active" ? "success" : "error"}
                                                size="small"
                                                icon={
                                                    user.status === "active" ? <CheckCircle /> : <Block />
                                                }
                                            />
                                        </TableCell>

                                        <TableCell>
                                            <Typography variant="body2">
                                                {format(user.createdAt, "dd/MM/yyyy", { locale: es })}
                                            </Typography>
                                        </TableCell>

                                        <TableCell>
                                            <Typography variant="body2">
                                                {user.lastLogin
                                                    ? format(user.lastLogin, "dd/MM/yyyy HH:mm", {
                                                        locale: es,
                                                    })
                                                    : "-"}
                                            </Typography>
                                        </TableCell>

                                        <TableCell align="right">
                                            <Tooltip title="Ver detalles">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleViewDetails(user)}
                                                >
                                                    <Info />
                                                </IconButton>
                                            </Tooltip>

                                            <IconButton
                                                size="small"
                                                onClick={(e) => handleMenuOpen(e, user)}
                                            >
                                                <MoreVert />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    component="div"
                    count={filteredUsers.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Filas por página:"
                    labelDisplayedRows={({ from, to, count }) =>
                        `${from}-${to} de ${count}`
                    }
                />
            </Card>

            {/* Actions Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                {menuUser && (
                    <>
                        {menuUser.role === "user" ? (
                            <MenuItem onClick={() => handleChangeRole(menuUser, "admin")}>
                                <AdminPanelSettings sx={{ mr: 1 }} /> Hacer Admin
                            </MenuItem>
                        ) : (
                            <MenuItem onClick={() => handleChangeRole(menuUser, "user")}>
                                <Person sx={{ mr: 1 }} /> Quitar Admin
                            </MenuItem>
                        )}

                        {menuUser.status === "active" ? (
                            <MenuItem onClick={() => handleBanUser(menuUser)}>
                                <Block sx={{ mr: 1 }} /> Banear Usuario
                            </MenuItem>
                        ) : (
                            <MenuItem onClick={() => handleBanUser(menuUser)}>
                                <CheckCircle sx={{ mr: 1 }} /> Desbanear Usuario
                            </MenuItem>
                        )}

                        <MenuItem onClick={() => handleDeleteUser(menuUser)} sx={{ color: "error.main" }}>
                            <Delete sx={{ mr: 1 }} /> Eliminar Usuario
                        </MenuItem>
                    </>
                )}
            </Menu>

            {/* Details Dialog */}
            <Dialog
                open={detailsDialog}
                onClose={() => setDetailsDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Detalles del Usuario</DialogTitle>
                <DialogContent>
                    {selectedUser && (
                        <Stack spacing={2} mt={1}>
                            <Box textAlign="center">
                                <Avatar
                                    src={selectedUser.photoURL}
                                    sx={{ width: 80, height: 80, mx: "auto", mb: 2 }}
                                >
                                    <Person sx={{ fontSize: 40 }} />
                                </Avatar>
                                <Typography variant="h6">
                                    {selectedUser.displayName || "Sin nombre"}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {selectedUser.email}
                                </Typography>
                            </Box>

                            <Stack direction="row" spacing={1} justifyContent="center">
                                <Chip
                                    label={selectedUser.role}
                                    color={selectedUser.role === "admin" ? "primary" : "default"}
                                />
                                <Chip
                                    label={selectedUser.status}
                                    color={selectedUser.status === "active" ? "success" : "error"}
                                />
                            </Stack>

                            {userStats && (
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography variant="subtitle2" gutterBottom>
                                            Estadísticas
                                        </Typography>
                                        <Stack spacing={1}>
                                            <Stack direction="row" justifyContent="space-between">
                                                <Typography variant="body2">Exámenes subidos:</Typography>
                                                <Typography variant="body2" fontWeight="bold">
                                                    {userStats.uploadsCount}
                                                </Typography>
                                            </Stack>
                                            <Stack direction="row" justifyContent="space-between">
                                                <Typography variant="body2">Exámenes aprobados:</Typography>
                                                <Typography variant="body2" fontWeight="bold">
                                                    {userStats.approvedExamsCount}
                                                </Typography>
                                            </Stack>
                                            <Stack direction="row" justifyContent="space-between">
                                                <Typography variant="body2">Descargas:</Typography>
                                                <Typography variant="body2" fontWeight="bold">
                                                    {userStats.downloadsCount}
                                                </Typography>
                                            </Stack>
                                            <Stack direction="row" justifyContent="space-between">
                                                <Typography variant="body2">Calificaciones:</Typography>
                                                <Typography variant="body2" fontWeight="bold">
                                                    {userStats.ratingsCount}
                                                </Typography>
                                            </Stack>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            )}

                            <Typography variant="caption" color="text.secondary">
                                UID: {selectedUser.uid}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Registrado: {format(selectedUser.createdAt, "dd/MM/yyyy HH:mm", { locale: es })}
                            </Typography>
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDetailsDialog(false)}>Cerrar</Button>
                </DialogActions>
            </Dialog>

            {/* Confirm Dialog */}
            <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
                <DialogTitle>Confirmar Acción</DialogTitle>
                <DialogContent>
                    {confirmAction.user && (
                        <Typography>
                            {confirmAction.type === "role" &&
                                `¿Cambiar rol de ${confirmAction.user.email} a ${confirmAction.newValue}?`}
                            {confirmAction.type === "ban" &&
                                `¿Banear a ${confirmAction.user.email}?`}
                            {confirmAction.type === "unban" &&
                                `¿Desbanear a ${confirmAction.user.email}?`}
                            {confirmAction.type === "delete" &&
                                `¿Eliminar a ${confirmAction.user.email}? (Solo se elimina de Firestore, no de Auth)`}
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDialog(false)}>Cancelar</Button>
                    <Button
                        onClick={executeAction}
                        variant="contained"
                        color={confirmAction.type === "delete" ? "error" : "primary"}
                    >
                        Confirmar
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