import { Box, Chip, Stack, Typography } from "@mui/material";

import DashboardSection from "./DashboardSection";

const deadlines = [
  {
    id: 1,
    title: "Database Assignment",
    date: "Tomorrow",
    status: "Urgent",
    color: "error",
  },
  {
    id: 2,
    title: "Computer Networks Exam",
    date: "In 3 days",
    status: "Upcoming",
    color: "warning",
  },
  {
    id: 3,
    title: "Submit Mini Project",
    date: "In 5 days",
    status: "Upcoming",
    color: "primary",
  },
];

export default function UpcomingDeadlines() {
  return (
    <DashboardSection title="Upcoming Deadlines">
      <Stack spacing={1} sx={{ mt: 2 }}>
        {deadlines.map((deadline) => (
          <Box
            key={deadline.id}
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: "background.default",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1,
              }}
            >
              <Typography fontWeight={600} noWrap>
                {deadline.title}
              </Typography>

              <Chip
                label={deadline.status}
                color={deadline.color}
                size="small"
              />
            </Box>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.75 }}
            >
              {deadline.date}
            </Typography>
          </Box>
        ))}
      </Stack>
    </DashboardSection>
  );
}