import { createBrowserRouter } from "react-router-dom";
import LoginPage from "../auth/LoginPage";
import RegisterPage from "../auth/RegisterPage";
import ProtectedRoute from "@/auth/ProtectedRoute";
import ExamsPage from "@/exams/pages/ExamsPage";
import VerifyEmailPage from "@/auth/VerifyEmailPage";
// import LoginPage from "@/auth/LoginPage";
// import RegisterPage from "@/auth/RegisterPage";
// import ExamsPage from "@/exams/pages/ExamsPage";
// import ExamDetailPage from "@/exams/pages/ExamDetailPage";
// import CompleteProfilePage from "@/auth/CompleteProfilePage";
// import ProtectedRoute from "@/auth/ProtectedRoute";

export const router = createBrowserRouter([
  { path: "/", element: <LoginPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/verify-email", element: <VerifyEmailPage /> },


  {
    element: <ProtectedRoute />,
    children: [
      { path: "/exams", element: <ExamsPage /> },
    ],
  },

  { path: "*", element: <LoginPage /> },


  // {
  //   element: <ProtectedRoute />,
  //   children: [
  //     { path: "/complete-profile", element: <CompleteProfilePage /> },
  //     { path: "/exams", element: <ExamsPage /> },
  //     { path: "/exams/:id", element: <ExamDetailPage /> },
  //     { path: "/upload", element: <UploadExamPage /> },
  //     { path: "/profile", element: <ProfilePage /> },
  //   ],
  // },
]);
