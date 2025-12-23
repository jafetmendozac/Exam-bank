import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "@/auth/context/useAuth"

export default function PublicRoute() {
  const { user, loading } = useAuth()

  if (loading) return null

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
