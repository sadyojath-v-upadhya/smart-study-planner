import { BrowserRouter, Route, Routes } from "react-router-dom";

import { MainLayout } from "../components/layout";
import DashboardPage from "../features/dashboard/DashboardPage";
import SubjectsPage from "../features/subjects/SubjectsPage";
import TopicsPage from "../features/topics/TopicsPage";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/subjects" element={<SubjectsPage />} />
          <Route
            path="/subjects/:subjectId/topics"
            element={<TopicsPage />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}