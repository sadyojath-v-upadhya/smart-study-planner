import { Box, Chip, Stack, Typography } from "@mui/material";
import DashboardSection from "./DashboardSection";

export default function TodayTasks({ tasks = [] }) {
  return (
    <DashboardSection title="Today's Schedule & Due Items">
      {tasks.length === 0 ? (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 3, textAlign: "center", py: 3 }}
        >
          No study sessions or assignments scheduled for today.
        </Typography>
      ) : (
        <Stack spacing={1} sx={{ mt: 2 }}>
          {tasks.map((task) => (
            <Box
              key={`${task.type}-${task.id}`}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1,
                p: 1.5,
                borderRadius: 2,
                bgcolor: "background.default",
                borderLeft: 4,
                borderColor: task.completed ? "success.main" : "primary.main",
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="body1"
                  fontWeight={600}
                  noWrap
                  sx={{
                    textDecoration: task.completed ? "line-through" : "none",
                    color: task.completed ? "text.secondary" : "text.primary",
                  }}
                >
                  {task.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {task.subject_name} •{" "}
                  {task.type === "session"
                    ? `Session (${task.duration_minutes}m)`
                    : "Assignment Due"}
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
      )}
    </DashboardSection>
  );
}
