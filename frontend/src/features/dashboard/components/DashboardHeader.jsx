import { AddOutlined, FileDownloadOutlined } from "@mui/icons-material";
import { Box, Button, Stack, Typography } from "@mui/material";

export default function DashboardHeader({ onExportClick, onAddTask }) {
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
          Academic Overview
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mt: 0.5 }}
        >
          Monitor your syllabus completion, active deadlines, and logged study hours.
        </Typography>
      </Box>

      <Stack direction="row" spacing={1.5}>
        <Button
          variant="outlined"
          startIcon={<FileDownloadOutlined />}
          onClick={onExportClick}
        >
          Export / Report
        </Button>

        <Button
          variant="contained"
          startIcon={<AddOutlined />}
          onClick={onAddTask}
        >
          Add Task
        </Button>
      </Stack>
    </Box>
  );
}
