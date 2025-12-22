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


export const router = createBrowserRouter([
  { path: "/", element: <LandingPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/verify-email", element: <VerifyEmailPage /> },

  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "/exams", element: <ExamsPage /> },
          { path: "/help", element: <HelpPage />  },
          

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

  { path: "*", element: <LoginPage /> },
]);
