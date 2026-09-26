
import {
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";

import { DRAWER_WIDTH } from "../../constants/layout";
import { navigationItems } from "../../constants/navigation";

export default function Sidebar({
  isDesktop,
  mobileOpen,
  onClose,
}) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);

    if (!isDesktop) {
      onClose();
    }
  };

  return (
    <Drawer
      variant={isDesktop ? "permanent" : "temporary"}
      open={isDesktop || mobileOpen}
      onClose={onClose}
      ModalProps={{
        keepMounted: true,
      }}
      sx={{
        width: isDesktop ? DRAWER_WIDTH : "auto",
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: DRAWER_WIDTH,
          boxSizing: "border-box",
          ...(isDesktop && {
            position: "relative",
          }),
        },
      }}
    >
      <Box sx={{ px: 3, py: 2.5 }}>
        <Typography variant="h6">
          Smart Study Planner
        </Typography>
      </Box>

      <Divider />

      <List sx={{ px: 1.5, py: 2 }}>
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <ListItemButton
              key={item.path}
              selected={isActive}
              onClick={() => handleNavigation(item.path)}
              sx={{
                mb: 0.5,
                borderRadius: 2,
              }}
            >
              <ListItemIcon>
                <Icon />
              </ListItemIcon>

              <ListItemText primary={item.label} />
            </ListItemButton>
          );
        })}
      </List>
    </Drawer>
  );
}