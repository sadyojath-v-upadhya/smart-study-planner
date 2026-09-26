import { useState } from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

export default function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  const handleDrawerToggle = () => {
    setMobileOpen((previousValue) => !previousValue);
  };

  const handleDrawerClose = () => {
    setMobileOpen(false);
  };

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <TopBar
        isDesktop={isDesktop}
        onMenuClick={handleDrawerToggle}
      />

      <Box sx={{ display: "flex" }}>
        <Sidebar
          isDesktop={isDesktop}
          mobileOpen={mobileOpen}
          onClose={handleDrawerClose}
        />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            minWidth: 0,
            p: {
              xs: 2,
              sm: 3,
              md: 4,
            },
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}