import { AddOutlined } from "@mui/icons-material";
import { Box, Button, Typography } from "@mui/material";

export default function DashboardHeader() {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: {
          xs: "flex-start",
          sm: "center",
        },
        justifyContent: "space-between",
        flexDirection: {
          xs: "column",
          sm: "row",
        },
        gap: 2,
      }}
    >
      <Box>
        <Typography variant="h4" component="h2">
          Good evening!
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mt: 0.5 }}
        >
          Here&apos;s an overview of your study progress.
        </Typography>
      </Box>

      <Button
        variant="contained"
        startIcon={<AddOutlined />}
      >
        Add Task
      </Button>
    </Box>
  );
}