import { useState } from "react";

import {
  Box,
  MenuItem,
  Select,
  Typography,
  useTheme,
} from "@mui/material";

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
import { studyProgressData } from "../dashboardData";

export default function StudyProgressChart() {
  const theme = useTheme();

  const [range, setRange] = useState("7d");

  const data = studyProgressData[range];

  return (
    <DashboardSection title="Study Progress">
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          mb: 2,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Study hours
        </Typography>

        <Select
          value={range}
          onChange={(event) => setRange(event.target.value)}
          size="small"
          sx={{ minWidth: 110 }}
        >
          <MenuItem value="7d">7 Days</MenuItem>
          <MenuItem value="30d">30 Days</MenuItem>
        </Select>
      </Box>

      <Box sx={{ width: "100%", height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 10,
              right: 10,
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

            <Tooltip />

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
    </DashboardSection>
  );
}