import { useState } from "react";
import {
  LogoutOutlined,
  MenuOutlined,
  NotificationsNoneOutlined,
} from "@mui/icons-material";
import {
  AppBar,
  Avatar,
  Box,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { navigationItems } from "../../constants/navigation";
import { useAuth } from "../../features/auth/AuthContext";

export default function TopBar({ isDesktop, onMenuClick }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  const currentPage = navigationItems.find(
    (item) => item.path === location.pathname
  );

  const pageTitle = currentPage?.label ?? "Smart Study Planner";

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleCloseMenu();
    logout();
    navigate("/login");
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

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

        <Tooltip title="Account profile">
          <IconButton
            aria-label="profile"
            onClick={handleProfileClick}
            sx={{ ml: 1 }}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: "secondary.main",
                fontWeight: "bold",
                fontSize: "0.95rem",
              }}
            >
              {userInitial}
            </Avatar>
          </IconButton>
        </Tooltip>

        <Menu
          anchorEl={anchorEl}
          open={openMenu}
          onClose={handleCloseMenu}
          onClick={handleCloseMenu}
          PaperProps={{
            elevation: 3,
            sx: {
              mt: 1.5,
              minWidth: 200,
              borderRadius: 2,
              filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.15))",
            },
          }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" fontWeight="bold">
              {user?.name || "Student"}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              {user?.email || ""}
            </Typography>
          </Box>
          <Divider />
          <MenuItem onClick={handleLogout} sx={{ color: "error.main", py: 1 }}>
            <ListItemIcon sx={{ color: "error.main" }}>
              <LogoutOutlined fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Log Out" />
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
