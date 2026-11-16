import { Box, useTheme, Typography } from "@mui/material";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import DashboardSection from "./DashboardSection";

export default function StudyProgressChart({ data = [] }) {
  const theme = useTheme();

  return (
    <DashboardSection title="Study Hours (Last 7 Days)">
      {data.length === 0 ? (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 2, textAlign: "center", py: 4 }}
        >
          No study session data available yet.
        </Typography>
      ) : (
        <Box sx={{ width: "100%", height: 260, mt: 2 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 10,
                right: 20,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid
                stroke={theme.palette.divider}
                strokeDasharray="3 3"
              />
              <XAxis
                dataKey="day"
                stroke={theme.palette.text.secondary}
              />
              <YAxis
                stroke={theme.palette.text.secondary}
                allowDecimals
              />
              <Tooltip
                formatter={(val) => [`${val} hrs`, "Study Time"]}
                labelFormatter={(label, payload) => {
                  if (payload && payload[0]) {
                    return `${payload[0].payload.full_date} (${label})`;
                  }
                  return label;
                }}
              />
              <Line
                type="monotone"
                dataKey="hours"
                stroke={theme.palette.primary.main}
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      )}
    </DashboardSection>
  );
}
