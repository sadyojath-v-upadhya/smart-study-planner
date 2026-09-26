import {
  Box,
  Checkbox,
  Chip,
  Stack,
  Typography,
} from "@mui/material";

import DashboardSection from "./DashboardSection";

const todayTasks = [
  {
    id: 1,
    title: "Complete React revision",
    completed: true,
  },
  {
    id: 2,
    title: "Solve 3 DSA problems",
    completed: false,
  },
  {
    id: 3,
    title: "Prepare Operating Systems notes",
    completed: false,
  },
];

export default function TodayTasks() {
  return (
    <DashboardSection title="Today's Tasks">
      <Stack spacing={1} sx={{ mt: 2 }}>
        {todayTasks.map((task) => (
          <Box
            key={task.id}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
              p: 1,
              borderRadius: 2,
              bgcolor: "background.default",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                minWidth: 0,
              }}
            >
              <Checkbox checked={task.completed} disabled />

              <Typography
                noWrap
                sx={{
                  textDecoration: task.completed
                    ? "line-through"
                    : "none",
                  color: task.completed
                    ? "text.secondary"
                    : "text.primary",
                }}
              >
                {task.title}
              </Typography>
            </Box>

            <Chip
              label={task.completed ? "Completed" : "Pending"}
              color={task.completed ? "success" : "warning"}
              size="small"
            />
          </Box>
        ))}
      </Stack>
    </DashboardSection>
  );
}