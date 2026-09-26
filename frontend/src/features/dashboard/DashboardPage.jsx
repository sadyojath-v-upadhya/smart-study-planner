import { Box, Grid } from "@mui/material";

import DashboardHeader from "./components/DashboardHeader";
import StatCard from "./components/StatCard";
import TodayTasks from "./components/TodayTasks";
import UpcomingDeadlines from "./components/UpcomingDeadlines";
import { dashboardStats } from "./dashboardData";
import StudyProgressChart from "./components/StudyProgressChart";

export default function DashboardPage() {
  return (
    <Box>
      <DashboardHeader />

      <Grid
        container
        spacing={3}
        sx={{ mt: 1 }}
      >
        {dashboardStats.map((stat) => (
          <Grid
            key={stat.title}
            size={{
              xs: 12,
              sm: 6,
              lg: 3,
            }}
          >
            <StatCard
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
            />
          </Grid>
        ))}
      </Grid>

      <Grid
        container
        spacing={3}
        sx={{ mt: 3 }}
      >
        <Grid
          size={{
            xs: 12,
            lg: 7,
          }}
        >
          <TodayTasks />
        </Grid>

        <Grid
          size={{
            xs: 12,
            lg: 5,
          }}
        >
          <UpcomingDeadlines />
        </Grid>
      </Grid>
      <Grid
  container
  spacing={3}
  sx={{ mt: 3 }}
>
  <Grid size={{ xs: 12 }}>
    <StudyProgressChart />
  </Grid>
</Grid>
    </Box>
  );
}