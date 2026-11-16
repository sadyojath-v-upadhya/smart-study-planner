import {
  AccessTime,
  CheckCircleOutlined,
  DonutLargeOutlined,
  UpcomingOutlined,
} from "@mui/icons-material";
import { Box, Grid } from "@mui/material";
import { useCallback, useEffect, useState } from "react";

import DashboardHeader from "./components/DashboardHeader";
import StatCard from "./components/StatCard";
import StudyProgressChart from "./components/StudyProgressChart";
import SubjectProgressChart from "./components/SubjectProgressChart";
import TodayTasks from "./components/TodayTasks";
import UpcomingDeadlines from "./components/UpcomingDeadlines";

export default function DashboardPage() {
  const API_URL = import.meta.env.VITE_API_URL;

  const [analytics, setAnalytics] = useState(null);
  const [deadlines, setDeadlines] = useState([]);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [analyticsRes, deadlinesRes] = await Promise.all([
        fetch(`${API_URL}/api/analytics/dashboard`),
        fetch(`${API_URL}/api/deadlines/upcoming`),
      ]);

      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        setAnalytics(data);
      }

      if (deadlinesRes.ok) {
        const deadlineData = await deadlinesRes.json();
        setDeadlines(deadlineData);
      }
    } catch (err) {
      console.error("Error fetching live dashboard analytics:", err);
    }
  }, [API_URL]);

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
      <DashboardHeader />

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
    </Box>
  );
}
