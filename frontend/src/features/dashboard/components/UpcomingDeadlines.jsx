import { Box, Chip, Stack, Typography } from "@mui/material";
import DashboardSection from "./DashboardSection";

const getDaysBadge = (daysLeft) => {
  const d = Number(daysLeft);
  if (d < 0) return { label: `${Math.abs(d)}d overdue`, color: "error" };
  if (d === 0) return { label: "Today", color: "error" };
  if (d === 1) return { label: "Tomorrow", color: "warning" };
  if (d <= 5) return { label: `In ${d} days`, color: "warning" };
  return { label: `In ${d} days`, color: "default" };
};

export default function UpcomingDeadlines({ deadlines = [] }) {
  return (
    <DashboardSection title="Upcoming Deadlines">
      {deadlines.length === 0 ? (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 3, textAlign: "center", py: 3 }}
        >
          No upcoming deadlines. You're all caught up!
        </Typography>
      ) : (
        <Stack spacing={1} sx={{ mt: 2 }}>
          {deadlines.slice(0, 4).map((deadline) => {
            const badge = getDaysBadge(deadline.days_left);
            const isExam = deadline.type === "exam";

            return (
              <Box
                key={`${deadline.type}-${deadline.id}`}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: "background.default",
                  borderLeft: 4,
                  borderColor: isExam ? "secondary.main" : "primary.main",
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
                    label={badge.label}
                    color={badge.color}
                    size="small"
                  />
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mt: 0.5,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {deadline.subject_name} ({isExam ? "Exam" : "Assignment"})
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {deadline.deadline_date}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Stack>
      )}
    </DashboardSection>
  );
}
