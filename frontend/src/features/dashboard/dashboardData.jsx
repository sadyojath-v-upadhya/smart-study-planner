import {
  CheckCircleOutlined,
  PendingActionsOutlined,
  TaskAltOutlined,
  UpcomingOutlined,
} from "@mui/icons-material";

export const dashboardStats = [
  {
    title: "Total Tasks",
    value: 12,
    icon: <TaskAltOutlined />,
    color: "primary",
  },
  {
    title: "Completed",
    value: 8,
    icon: <CheckCircleOutlined />,
    color: "success",
  },
  {
    title: "Pending",
    value: 3,
    icon: <PendingActionsOutlined />,
    color: "warning",
  },
  {
    title: "Upcoming",
    value: 2,
    icon: <UpcomingOutlined />,
    color: "secondary",
  },
];

export const studyProgressData = {
  "7d": [
    { day: "Mon", hours: 2 },
    { day: "Tue", hours: 3.5 },
    { day: "Wed", hours: 1.5 },
    { day: "Thu", hours: 4 },
    { day: "Fri", hours: 3 },
    { day: "Sat", hours: 5 },
    { day: "Sun", hours: 2.5 },
  ],

  "30d": [
    { day: "Week 1", hours: 18 },
    { day: "Week 2", hours: 22 },
    { day: "Week 3", hours: 16 },
    { day: "Week 4", hours: 25 },
  ],
};