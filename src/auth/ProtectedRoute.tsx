import { Navigate, Outlet } from "react-router-dom";
import { isUnitruEmail } from "@/shared/utils/isUnitruEmail";
import { useAuth } from "./context/useAuth";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.emailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  if (!user.email || !isUnitruEmail(user.email)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
