import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
//import useRefreshTokenOnLoad from "../hooks/useRefreshTokenOnLoad";

// Layout
import Login from "../pages/Login/Login";
import NotFound from "../pages/NotFound/NotFound";
import MainLayout from "../layouts/MainLayout";
import ForgotPassword from "../pages/ForgotPassword/ForgotPassword";
import Profile from "../pages/Profile/Profile";
import UpdateProfile from "../pages/Profile/UpdateProfile/UpdateProfile";
import ResourceDetail from "../pages/Resource/ResourceDetail";

// Admin Pages
import DashboardPage from "../pages/Admin/Dashboard/Dashboard";
import VipManagement from "../pages/Admin/VipManagement/VipManagement";
import UserManagementPage from "../pages/Admin/UserManagement/UserManagement";
import TestManagementPage from "../pages/Admin/TestManagement/TestManagement";
import LessonManagementPage from "../pages/Admin/LessonManagement/LessonManagement";
import CreatePartPage from "../pages/Admin/TestManagement/CreatePartPage/CreatePartPage";
import CreateQuestionPage from "../pages/Admin/TestManagement/CreateQuestionPage/CreateQuestionPage";
import TestImportPage from "../pages/Admin/TestManagement/ImportTestPage/TestImportPage";
import FlashcardPage from "../pages/FlashCard/FlashcardPage";
import FlashcardListPage from "../pages/FlashCard/FlashcardListPage";
import AdminPrivacy from "../pages/Info/Privacy";
import AdminTerms from "../pages/Info/Terms";

// Cấu hình routes
const routes = [
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login", // Trang dành cho Guest (Guest-only)
    element: (
      <MainLayout>
        <Login />
      </MainLayout>
    ),
  },
  {
    path: "/forgot-password", // Trang dành cho Guest (Guest-only)
    element: (
      <MainLayout>
        <ForgotPassword />
      </MainLayout>
    ),
  },
  {
    path: "/terms",
    element: (
      <MainLayout>
        <AdminTerms />
      </MainLayout>
    ),
  },
  {
    path: "/privacy",
    element: (
      <MainLayout>
        <AdminPrivacy />
      </MainLayout>
    ),
  },
  {
    path: "*", // Trang 404
    element: (
      <MainLayout>
        <NotFound />
      </MainLayout>
    ),
  },
  {
    path: "/admin/profile",
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <MainLayout>
          <Profile />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/profile/update-info",
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <MainLayout>
          <UpdateProfile />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/dashboard",
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <MainLayout>
          <DashboardPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/usermanagement",
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <MainLayout>
          <UserManagementPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
    {
    path: "/admin/flashcard",
    element: (
      <MainLayout>
        <FlashcardPage />
      </MainLayout>
    ),
  },
  {
    path: "/admin/flashcards/:setId",
    element: (
      <MainLayout>
        <FlashcardListPage />
      </MainLayout>
    ),
  },
  {
    path: "/admin/lessonmanagement",
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <MainLayout>
          <LessonManagementPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
    {
    path: "/resource/:id",
    element: (
      <MainLayout>
        <ResourceDetail />
      </MainLayout>
    ),
  },
  {
    path: "/admin/testmanagement",
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <MainLayout>
          <TestManagementPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/vipmanagement",
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <MainLayout>
          <VipManagement />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/import-test",
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <MainLayout>
          <TestImportPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/create-part",
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <MainLayout>
          <CreatePartPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/create-questions",
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <MainLayout>
          <CreateQuestionPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
];

const AppRoutes = () => {
  const router = createBrowserRouter(routes);
  return <RouterProvider router={router} />;
};

export default AppRoutes;