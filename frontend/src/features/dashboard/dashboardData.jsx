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