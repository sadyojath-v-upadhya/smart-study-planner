import {
  Box,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Typography,
} from "@mui/material";

export default function SubjectCard({
  name,
  description,
  progress,
  topicCount,
  onViewTopics,
  onEdit,
  onDelete,
}) {
  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <Typography variant="h6" component="h2">
          {name}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 0.5, flexGrow: 1 }}
        >
          {description}
        </Typography>

        <Box sx={{ mt: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mb: 1,
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Progress
            </Typography>

            <Typography variant="body2" fontWeight={600}>
              {progress}%
            </Typography>
          </Box>

          <LinearProgress
            variant="determinate"
            value={progress}
          />
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 2 }}
        >
          {topicCount} {topicCount === 1 ? "topic" : "topics"}
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: 1,
            mt: 2,
            pt: 1,
            borderTop: 1,
            borderColor: "divider",
            flexWrap: "wrap",
          }}
        >
          <Button
            variant="contained"
            size="small"
            onClick={onViewTopics}
          >
            View Topics
          </Button>

          <Button
            variant="outlined"
            size="small"
            onClick={onEdit}
          >
            Edit
          </Button>

          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={onDelete}
          >
            Delete
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
