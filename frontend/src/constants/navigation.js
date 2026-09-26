import {
  AnalyticsOutlined,
  AssignmentOutlined,
  CalendarMonthOutlined,
  DashboardOutlined,
  MenuBookOutlined,
  TaskAltOutlined,
} from "@mui/icons-material";

export const navigationItems = [
  {
    label: "Dashboard",
    path: "/",
    icon: DashboardOutlined,
  },
  {
    label: "Subjects",
    path: "/subjects",
    icon: MenuBookOutlined,
  },
  {
    label: "Planner",
    path: "/planner",
    icon: CalendarMonthOutlined,
  },
  {
    label: "Tasks",
    path: "/tasks",
    icon: TaskAltOutlined,
  },
  {
    label: "Assignments",
    path: "/assignments",
    icon: AssignmentOutlined,
  },
  {
    label: "Analytics",
    path: "/analytics",
    icon: AnalyticsOutlined,
  },
];