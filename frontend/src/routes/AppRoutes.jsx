import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "../components/common/ProtectedRoute";
import { MainLayout } from "../components/layout";
import AssignmentsPage from "../features/assignments/AssignmentsPage";
import { AuthProvider } from "../features/auth/AuthContext";
import LoginPage from "../features/auth/LoginPage";
import RegisterPage from "../features/auth/RegisterPage";
import DashboardPage from "../features/dashboard/DashboardPage";
import PlannerPage from "../features/planner/PlannerPage";
import SubjectsPage from "../features/subjects/SubjectsPage";
import TopicsPage from "../features/topics/TopicsPage";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Application Routes */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/subjects" element={<SubjectsPage />} />
            <Route
              path="/subjects/:subjectId/topics"
              element={<TopicsPage />}
            />
            <Route path="/planner" element={<PlannerPage />} />
            <Route path="/assignments" element={<AssignmentsPage />} />
            <Route path="/tasks" element={<AssignmentsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
