import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  EmojiEventsOutlined,
  LocalFireDepartment,
  TodayOutlined,
  TrendingUpOutlined,
} from "@mui/icons-material";
import { API_URL, authFetch } from "../../../utils/api";

const LEVEL_COLORS = {
  0: "#ebedf0", // No study
  1: "#9be9a8", // 1 - 30 mins
  2: "#40c463", // 31 - 60 mins
  3: "#30a14e", // 61 - 120 mins
  4: "#216e39", // > 120 mins
};

export default function StudyStreakHeatmap() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStreakData = async () => {
      try {
        const res = await authFetch(`${API_URL}/api/analytics/streak`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Error fetching streak data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStreakData();
  }, []);

  if (loading) {
    return (
      <Card sx={{ p: 3, textAlign: "center", borderRadius: 3 }}>
        <CircularProgress size={28} />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Loading study activity heatmap...
        </Typography>
      </Card>
    );
  }

  if (!data) return null;

  const {
    currentStreak,
    longestStreak,
    totalActiveDays,
    studiedToday,
    consistencyLast30Days,
    heatmap = [],
  } = data;

  return (
    <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        {/* Header: Streak Counter + Highlights */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            mb: 3,
          }}
        >
          {/* Left: Streak Counter */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: 2.5,
                bgcolor: currentStreak > 0 ? "warning.light" : "grey.100",
                color: currentStreak > 0 ? "warning.dark" : "text.secondary",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LocalFireDepartment sx={{ fontSize: 34 }} />
            </Box>

            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="h5" component="div" fontWeight="bold">
                  {currentStreak} {currentStreak === 1 ? "Day" : "Days"} Streak
                </Typography>
                {studiedToday ? (
                  <Chip
                    label="Logged Today ✓"
                    size="small"
                    color="success"
                    sx={{ fontWeight: "bold", fontSize: "0.75rem" }}
                  />
                ) : currentStreak > 0 ? (
                  <Chip
                    label="Study today to keep it!"
                    size="small"
                    color="warning"
                    sx={{ fontWeight: "bold", fontSize: "0.75rem" }}
                  />
                ) : (
                  <Chip
                    label="Ready to start!"
                    size="small"
                    sx={{ fontSize: "0.75rem" }}
                  />
                )}
              </Box>

              <Typography variant="body2" color="text.secondary">
                {currentStreak > 0
                  ? "Consistency is key to mastery. Great work!"
                  : "Complete a study session today to start your streak!"}
              </Typography>
            </Box>
          </Box>

          {/* Right: Key Streak Stats */}
          <Stack
            direction="row"
            spacing={2}
            sx={{ flexWrap: "wrap", rowGap: 1 }}
          >
            <Box
              sx={{
                p: 1.2,
                px: 2,
                bgcolor: "grey.50",
                borderRadius: 2,
                border: "1px solid #e0e0e0",
                textAlign: "center",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "text.secondary" }}>
                <EmojiEventsOutlined sx={{ fontSize: 16, color: "warning.main" }} />
                <Typography variant="caption" fontWeight="bold">
                  Longest
                </Typography>
              </Box>
              <Typography variant="subtitle2" fontWeight="bold">
                {longestStreak} {longestStreak === 1 ? "day" : "days"}
              </Typography>
            </Box>

            <Box
              sx={{
                p: 1.2,
                px: 2,
                bgcolor: "grey.50",
                borderRadius: 2,
                border: "1px solid #e0e0e0",
                textAlign: "center",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "text.secondary" }}>
                <TodayOutlined sx={{ fontSize: 16, color: "primary.main" }} />
                <Typography variant="caption" fontWeight="bold">
                  Active
                </Typography>
              </Box>
              <Typography variant="subtitle2" fontWeight="bold">
                {totalActiveDays} {totalActiveDays === 1 ? "day" : "days"}
              </Typography>
            </Box>

            <Box
              sx={{
                p: 1.2,
                px: 2,
                bgcolor: "grey.50",
                borderRadius: 2,
                border: "1px solid #e0e0e0",
                textAlign: "center",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "text.secondary" }}>
                <TrendingUpOutlined sx={{ fontSize: 16, color: "success.main" }} />
                <Typography variant="caption" fontWeight="bold">
                  30-Day Rate
                </Typography>
              </Box>
              <Typography variant="subtitle2" fontWeight="bold">
                {consistencyLast30Days}%
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Heatmap Grid Section */}
        <Box sx={{ mt: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1.5,
            }}
          >
            <Typography variant="subtitle2" fontWeight="bold">
              Study Activity (Last 60 Days)
            </Typography>

            {/* Legend */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5 }}>
                Less
              </Typography>
              {[0, 1, 2, 3, 4].map((lvl) => (
                <Box
                  key={lvl}
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: "3px",
                    bgcolor: LEVEL_COLORS[lvl],
                  }}
                />
              ))}
              <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                More
              </Typography>
            </Box>
          </Box>

          {/* Contribution Calendar Grid */}
          <Box
            sx={{
              overflowX: "auto",
              py: 1,
              display: "flex",
              justifyContent: { xs: "flex-start", md: "center" },
            }}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateRows: "repeat(7, 15px)",
                gridAutoFlow: "column",
                gap: "5px",
              }}
            >
              {heatmap.map((item) => {
                const tooltipText =
                  item.totalMinutes > 0
                    ? `${item.date} (${item.dayName}): ${item.totalMinutes} mins studied • ${item.sessionCount} session(s)`
                    : `${item.date} (${item.dayName}): No study activity logged`;

                return (
                  <Tooltip key={item.date} title={tooltipText} arrow placement="top">
                    <Box
                      sx={{
                        width: 15,
                        height: 15,
                        borderRadius: "3px",
                        bgcolor: LEVEL_COLORS[item.level],
                        cursor: "pointer",
                        transition: "all 0.15s ease-in-out",
                        "&:hover": {
                          transform: "scale(1.25)",
                          zIndex: 10,
                          boxShadow: "0 0 4px rgba(0,0,0,0.3)",
                        },
                      }}
                    />
                  </Tooltip>
                );
              })}
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
