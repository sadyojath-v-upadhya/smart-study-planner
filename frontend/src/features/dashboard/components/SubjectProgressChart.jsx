import { Box, Typography, useTheme } from "@mui/material";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import DashboardSection from "./DashboardSection";

export default function SubjectProgressChart({ data = [] }) {
  const theme = useTheme();

  return (
    <DashboardSection title="Subject Progress (%)">
      {data.length === 0 ? (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 2, textAlign: "center", py: 4 }}
        >
          No subjects created yet.
        </Typography>
      ) : (
        <Box sx={{ width: "100%", height: 260, mt: 2 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
            >
              <CartesianGrid
                stroke={theme.palette.divider}
                strokeDasharray="3 3"
              />
              <XAxis
                dataKey="name"
                stroke={theme.palette.text.secondary}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                domain={[0, 100]}
                stroke={theme.palette.text.secondary}
              />
              <Tooltip
                formatter={(val, name, item) => [
                  `${val}% (${item.payload.completedTopics}/${item.payload.topicCount} topics)`,
                  "Progress",
                ]}
              />
              <Bar
                dataKey="progress"
                fill={theme.palette.secondary.main}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )}
    </DashboardSection>
  );
}
