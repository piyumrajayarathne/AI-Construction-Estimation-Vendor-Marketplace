import { Navigate, Route, Routes } from "react-router-dom";
import { GuestRoute, ProtectedRoute } from "./components/ProtectedRoute";
import { AppLayout } from "./layouts/AppLayout";
import { AuthLayout } from "./layouts/AuthLayout";
import { AdminHomePage } from "./pages/AdminHomePage";
import { AssistantPage } from "./pages/AssistantPage";
import { CreateProjectPage } from "./pages/CreateProjectPage";
import { DashboardPage } from "./pages/DashboardPage";
import { DocumentDetailPage } from "./pages/DocumentDetailPage";
import { EstimationResultsPage } from "./pages/EstimationResultsPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { MarketplacePage } from "./pages/MarketplacePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ProjectActivityPage } from "./pages/ProjectActivityPage";
import { ProjectDetailsPage } from "./pages/ProjectDetailsPage";
import { ProjectDocumentsPage } from "./pages/ProjectDocumentsPage";
import { ProjectEditPage } from "./pages/ProjectEditPage";
import { ProjectListPage } from "./pages/ProjectListPage";
import { RegisterPage } from "./pages/RegisterPage";
import { VendorHomePage } from "./pages/VendorHomePage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      <Route element={<GuestRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/projects" element={<ProjectListPage />} />
          <Route path="/projects/new" element={<CreateProjectPage />} />
          <Route path="/projects/:projectId" element={<ProjectDetailsPage />} />
          <Route path="/projects/:projectId/edit" element={<ProjectEditPage />} />
          <Route path="/projects/:projectId/documents" element={<ProjectDocumentsPage />} />
          <Route path="/projects/:projectId/documents/:docId" element={<DocumentDetailPage />} />
          <Route path="/projects/:projectId/activity" element={<ProjectActivityPage />} />
          <Route path="/projects/:projectId/estimation" element={<EstimationResultsPage />} />
          <Route path="/assistant" element={<AssistantPage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/vendor" element={<VendorHomePage />} />
          <Route path="/admin" element={<AdminHomePage />} />
        </Route>
      </Route>

      <Route path="/home" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
