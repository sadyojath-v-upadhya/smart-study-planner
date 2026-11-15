import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import { Add, ArrowBack, Delete, Edit } from "@mui/icons-material";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AddTopicDialog from "./components/AddTopicDialog";
import EditTopicDialog from "./components/EditTopicDialog";
import DeleteTopicDialog from "./components/DeleteTopicDialog";

const getDifficultyColor = (difficulty) => {
  switch (difficulty) {
    case "Easy":
      return "success";
    case "Hard":
      return "error";
    case "Medium":
    default:
      return "warning";
  }
};

export default function TopicsPage() {
  const { subjectId } = useParams();
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

  const [subject, setSubject] = useState(null);
  const [topics, setTopics] = useState([]);
  const [editingTopic, setEditingTopic] = useState(null);
  const [deletingTopic, setDeletingTopic] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch subject details (name, description, progress)
  const fetchSubject = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/subjects/${subjectId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch subject");
      }

      const data = await response.json();
      setSubject(data);
    } catch (error) {
      console.error("Error fetching subject details:", error);
    }
  }, [API_URL, subjectId]);

  // Fetch topics for this subject
  const fetchTopics = useCallback(async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/topics/subject/${subjectId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch topics");
      }

      const data = await response.json();
      setTopics(data);
    } catch (error) {
      console.error("Error fetching topics:", error);
    }
  }, [API_URL, subjectId]);

  useEffect(() => {
    fetchSubject();
    fetchTopics();
  }, [fetchSubject, fetchTopics]);

  const handleAddTopic = async (data) => {
    try {
      const response = await fetch(`${API_URL}/api/topics`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subjectId: Number(subjectId),
          name: data.name,
          description: data.description,
          difficulty: data.difficulty || "Medium",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create topic");
      }

      await fetchTopics();
      await fetchSubject();
      setDialogOpen(false);
    } catch (error) {
      console.error("Error creating topic:", error);
    }
  };

  const handleUpdateTopic = async (data) => {
    try {
      const response = await fetch(
        `${API_URL}/api/topics/${editingTopic.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: data.name,
            description: data.description,
            completed: editingTopic.completed,
            difficulty: data.difficulty || editingTopic.difficulty || "Medium",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update topic");
      }

      await fetchTopics();
      setEditingTopic(null);
    } catch (error) {
      console.error("Error updating topic:", error);
    }
  };

  const handleDeleteTopic = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/topics/${deletingTopic.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete topic");
      }

      await fetchTopics();
      await fetchSubject();
      setDeletingTopic(null);
    } catch (error) {
      console.error("Error deleting topic:", error);
    }
  };

  const handleToggleCompleted = async (topic) => {
    try {
      const response = await fetch(`${API_URL}/api/topics/${topic.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: topic.name,
          description: topic.description,
          completed: !topic.completed,
          difficulty: topic.difficulty || "Medium",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update topic status");
      }

      await fetchTopics();
      await fetchSubject();
    } catch (error) {
      console.error("Error updating topic status:", error);
    }
  };

  const progressPercent = subject ? Number(subject.progress) : 0;

  return (
    <Box>
      {/* Back button */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate("/subjects")}
        sx={{ mb: 2 }}
      >
        Back to Subjects
      </Button>

      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 2,
          mb: 3,
          flexWrap: "wrap",
        }}
      >
        <Box sx={{ maxWidth: 600 }}>
          <Typography variant="h4" component="h1">
            {subject ? subject.name : "Topics"}
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            {subject ? subject.description : "Manage topics for this subject."}
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setDialogOpen(true)}
        >
          Add Topic
        </Button>
      </Box>

      {/* Subject Progress Summary Card */}
      {subject && (
        <Card sx={{ mb: 4, bgcolor: "background.paper" }}>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Overall Subject Progress ({subject.completed_topics || 0} of{" "}
                {subject.topic_count || 0} completed)
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {progressPercent}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progressPercent}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {topics.length === 0 ? (
        <Card sx={{ p: 4, textAlign: "center", bgcolor: "background.default" }}>
          <Typography variant="h6" color="text.secondary">
            No topics added yet.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
            Break down this subject by adding individual topics and tracking your completion.
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setDialogOpen(true)}
          >
            Add First Topic
          </Button>
        </Card>
      ) : (
        /* Topic List */
        <Stack spacing={2}>
          {topics.map((topic) => (
            <Card key={topic.id}>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 1.5,
                      flexGrow: 1,
                    }}
                  >
                    <Checkbox
                      checked={topic.completed}
                      onChange={() => handleToggleCompleted(topic)}
                      sx={{ p: 0, mt: 0.5 }}
                    />
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{
                          textDecoration: topic.completed
                            ? "line-through"
                            : "none",
                          color: topic.completed
                            ? "text.secondary"
                            : "text.primary",
                        }}
                      >
                        {topic.name}
                      </Typography>

                      <Typography
                        color="text.secondary"
                        variant="body2"
                        sx={{ mt: 0.5 }}
                      >
                        {topic.description}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <Chip
                      label={topic.difficulty || "Medium"}
                      color={getDifficultyColor(topic.difficulty)}
                      size="small"
                      variant="outlined"
                    />

                    <Chip
                      label={topic.completed ? "Completed" : "Pending"}
                      color={topic.completed ? "success" : "default"}
                      size="small"
                    />
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 1,
                    mt: 2,
                    pt: 1,
                    borderTop: 1,
                    borderColor: "divider",
                  }}
                >
                  <Button
                    size="small"
                    startIcon={<Edit />}
                    onClick={() => setEditingTopic(topic)}
                  >
                    Edit
                  </Button>

                  <Button
                    size="small"
                    color="error"
                    startIcon={<Delete />}
                    onClick={() => setDeletingTopic(topic)}
                  >
                    Delete
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {/* Add Topic Dialog */}
      <AddTopicDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onAdd={handleAddTopic}
      />

      {/* Edit Topic Dialog */}
      <EditTopicDialog
        open={Boolean(editingTopic)}
        onClose={() => setEditingTopic(null)}
        onUpdate={handleUpdateTopic}
        topic={editingTopic}
      />

      {/* Delete Topic Dialog */}
      <DeleteTopicDialog
        open={Boolean(deletingTopic)}
        onClose={() => setDeletingTopic(null)}
        onConfirm={handleDeleteTopic}
        topic={deletingTopic}
      />
    </Box>
  );
}
