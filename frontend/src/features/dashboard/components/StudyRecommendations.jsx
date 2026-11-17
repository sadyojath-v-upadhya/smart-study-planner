import {
  AutoAwesome,
  CalendarMonth,
  LightbulbOutlined,
  MenuBook,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import DashboardSection from "./DashboardSection";

const getUrgencyColor = (urgency) => {
  switch (urgency) {
    case "Urgent":
      return "error";
    case "High Priority":
      return "warning";
    case "Recommended":
    default:
      return "primary";
  }
};

const getDifficultyColor = (difficulty) => {
  switch (difficulty) {
    case "Hard":
      return "error";
    case "Easy":
      return "success";
    case "Medium":
    default:
      return "warning";
  }
};

export default function StudyRecommendations({
  recommendations = [],
  onSchedule,
}) {
  return (
    <DashboardSection title="Smart Study Recommendations">
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Algorithmic recommendations based on upcoming exams, topic difficulty, and subject progress.
        </Typography>
      </Box>

      {recommendations.length === 0 ? (
        <Card sx={{ p: 4, textAlign: "center", bgcolor: "background.default" }}>
          <Typography variant="h6" color="text.secondary">
            🎉 All caught up!
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            All topics across your subjects have been completed. Great job!
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {recommendations.map((rec) => (
            <Grid key={rec.topicId} size={{ xs: 12, md: 6 }}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  borderLeft: 4,
                  borderColor:
                    rec.urgency === "Urgent"
                      ? "error.main"
                      : rec.urgency === "High Priority"
                      ? "warning.main"
                      : "primary.main",
                }}
              >
                <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
                  {/* Top Bar: Subject & Urgency */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <MenuBook fontSize="small" color="primary" />
                      <Typography
                        variant="caption"
                        fontWeight={700}
                        color="primary"
                        sx={{ textTransform: "uppercase" }}
                      >
                        {rec.subjectName} ({rec.subjectProgress}%)
                      </Typography>
                    </Box>

                    <Chip
                      icon={<AutoAwesome fontSize="small" />}
                      label={rec.urgency}
                      color={getUrgencyColor(rec.urgency)}
                      size="small"
                    />
                  </Box>

                  {/* Topic Title */}
                  <Typography variant="h6" component="h3">
                    {rec.topicName}
                  </Typography>

                  {/* Badges: Difficulty & Recommended Session Duration */}
                  <Stack direction="row" spacing={1} sx={{ mt: 1, mb: 1.5 }}>
                    <Chip
                      label={rec.difficulty}
                      color={getDifficultyColor(rec.difficulty)}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      label={`Rec. Duration: ${rec.recommendedDuration} mins`}
                      size="small"
                      variant="outlined"
                    />
                  </Stack>

                  {/* Primary Reason for Recommendation */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 1,
                      bgcolor: "action.hover",
                      p: 1.5,
                      borderRadius: 1.5,
                      mt: "auto",
                      mb: 2,
                    }}
                  >
                    <LightbulbOutlined
                      fontSize="small"
                      color="warning"
                      sx={{ mt: 0.2 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {rec.primaryReason}
                    </Typography>
                  </Box>

                  {/* Action: 1-Click Schedule */}
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<CalendarMonth />}
                    onClick={() => onSchedule && onSchedule(rec)}
                    fullWidth
                  >
                    Schedule {rec.recommendedDuration}m Session
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </DashboardSection>
  );
}
