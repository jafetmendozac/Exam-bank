import { createBrowserRouter } from "react-router-dom";
import LoginPage from "../auth/LoginPage";
import RegisterPage from "../auth/RegisterPage";
import ProtectedRoute from "@/auth/ProtectedRoute";
import ExamsPage from "@/exams/pages/ExamsPage";
import VerifyEmailPage from "@/auth/VerifyEmailPage";
import AdminRoute from "@/auth/AdminRoute";
import AdminPage from "@/exams/pages/AdminPage";
import AppLayout from "@/shared/components/AppLayout";
import UploadExamForm from "@/exams/pages/UploadExamForm";
import DashboardPage from "@/exams/pages/DashboardPage";
import HelpPage from "@/exams/pages/HelpPage";
import LandingPage from "@/exams/pages/LandingPage";
import PublicRoute from "@/auth/PublicRoute";
import UnauthorizedPage from "@/exams/pages/UnauthorizedPage";
import NotFoundPage from "@/exams/pages/NotFoundPage";
import FavoritesPage from "@/exams/pages/FavoritesPage";
import NotificationsPage from "@/exams/pages/NotificationsPage";
import ProfilePage from "@/exams/pages/ProfilePage";
import ReportPage from "@/exams/pages/ReportPage";


export const router = createBrowserRouter([
  { path: "/", element: <LandingPage /> },

  {
    element: <PublicRoute />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
      { path: "/verify-email", element: <VerifyEmailPage /> },
    ],
  },

  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "/exams", element: <ExamsPage /> },
          { path: "/help", element: <HelpPage />  },
          { path: "/unauthorized", element: <UnauthorizedPage />  },
          { path: "/favorites", element: <FavoritesPage /> },
          { path: "/notifications", element: <NotificationsPage /> },
          { path: "/profile", element: <ProfilePage /> },
          { path: "/report", element: <ReportPage /> },

          
          {
            element: <AdminRoute />,
            children: [
              { path: "/upload", element: <UploadExamForm /> },
              { path: "/admin", element: <AdminPage /> },
            ],
          },
        ],
      },
    ],
  },

  { path: "*", element: <NotFoundPage /> },
]);
