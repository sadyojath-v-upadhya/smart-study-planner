import {
  MenuOutlined,
  NotificationsNoneOutlined,
} from "@mui/icons-material";
import {
  AppBar,
  Avatar,
  Box,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { useLocation } from "react-router-dom";
import { navigationItems } from "../../constants/navigation";

export default function TopBar({
  isDesktop,
  onMenuClick,
}) {
  const location = useLocation();

  const currentPage = navigationItems.find(
  (item) => item.path === location.pathname
);

const pageTitle = currentPage?.label ?? "Smart Study Planner";

  return (
    <AppBar position="static">
      <Toolbar sx={{ minHeight: 64 }}>
        {!isDesktop && (
          <IconButton
            edge="start"
            aria-label="open navigation menu"
            onClick={onMenuClick}
            sx={{ mr: 1 }}
          >
            <MenuOutlined />
          </IconButton>
        )}

        <Typography variant="h5" component="h1">
          {pageTitle}
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        <Tooltip title="Notifications">
          <IconButton aria-label="notifications">
            <NotificationsNoneOutlined />
          </IconButton>
        </Tooltip>

        <Tooltip title="Profile">
          <IconButton
            aria-label="profile"
            sx={{ ml: 1 }}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
              }}
            >
              U
            </Avatar>
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
}