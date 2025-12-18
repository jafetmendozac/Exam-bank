import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/auth/context/useAuth";

const AdminRoute = () => {
  const { role, loading } = useAuth();

  if (loading) return null;

  return role === "admin"
    ? <Outlet />
    : <Navigate to="/exams" replace />;
};

export default AdminRoute;
