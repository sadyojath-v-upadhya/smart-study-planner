import {
  AccessTime,
  CheckCircleOutlined,
  DonutLargeOutlined,
  UpcomingOutlined,
} from "@mui/icons-material";
import { Box, Grid } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardHeader from "./components/DashboardHeader";
import StatCard from "./components/StatCard";
import StudyProgressChart from "./components/StudyProgressChart";
import StudyRecommendations from "./components/StudyRecommendations";
import SubjectProgressChart from "./components/SubjectProgressChart";
import TodayTasks from "./components/TodayTasks";
import UpcomingDeadlines from "./components/UpcomingDeadlines";
import ExportDialog from "../export/ExportDialog";
import { API_URL, authFetch } from "../../utils/api";

export default function DashboardPage() {
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState(null);
  const [deadlines, setDeadlines] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [exportOpen, setExportOpen] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [analyticsRes, deadlinesRes, recsRes] = await Promise.all([
        authFetch(`${API_URL}/api/analytics/dashboard`),
        authFetch(`${API_URL}/api/deadlines/upcoming`),
        authFetch(`${API_URL}/api/recommendations?limit=4`),
      ]);

      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        setAnalytics(data);
      }

      if (deadlinesRes.ok) {
        const deadlineData = await deadlinesRes.json();
        setDeadlines(deadlineData);
      }

      if (recsRes.ok) {
        const recsData = await recsRes.json();
        setRecommendations(recsData);
      }
    } catch (err) {
      console.error("Error fetching live dashboard analytics:", err);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const overview = analytics?.overview || {};

  const stats = [
    {
      title: "Overall Progress",
      value: `${overview.overallProgress ?? 0}%`,
      icon: <DonutLargeOutlined />,
      color: "primary",
    },
    {
      title: "Completed Topics",
      value: `${overview.completedTopics ?? 0} / ${overview.totalTopics ?? 0}`,
      icon: <CheckCircleOutlined />,
      color: "success",
    },
    {
      title: "Study Hours Logged",
      value: `${overview.totalStudyHours ?? 0}h`,
      icon: <AccessTime />,
      color: "info",
    },
    {
      title: "Active Deadlines",
      value: `${(overview.pendingAssignments ?? 0) + (overview.upcomingExams ?? 0)}`,
      icon: <UpcomingOutlined />,
      color: "warning",
    },
  ];

  return (
    <Box>
      <DashboardHeader
        onExportClick={() => setExportOpen(true)}
        onAddTask={() => navigate("/assignments")}
      />

      {/* Live Stat Cards */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {stats.map((stat) => (
          <Grid key={stat.title} size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
            />
          </Grid>
        ))}
      </Grid>

      {/* Smart Recommendations Section */}
      <Box sx={{ mt: 3 }}>
        <StudyRecommendations
          recommendations={recommendations}
          onSchedule={(rec) =>
            navigate("/planner", { state: { prefill: rec } })
          }
        />
      </Box>

      {/* Charts Row: Study Hours Trend + Subject Progress */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <StudyProgressChart data={analytics?.studyTrend7d || []} />
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <SubjectProgressChart data={analytics?.subjectProgress || []} />
        </Grid>
      </Grid>

      {/* Action Row: Today's Tasks & Schedule + Upcoming Deadlines */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <TodayTasks tasks={analytics?.todayTasks || []} />
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <UpcomingDeadlines deadlines={deadlines} />
        </Grid>
      </Grid>

      {/* Export / Report Dialog */}
      <ExportDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
      />
    </Box>
  );
}
