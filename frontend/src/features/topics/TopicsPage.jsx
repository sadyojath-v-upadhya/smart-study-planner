import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import { Add, Delete, Edit } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AddTopicDialog from "./components/AddTopicDialog";
import EditTopicDialog from "./components/EditTopicDialog";
import DeleteTopicDialog from "./components/DeleteTopicDialog";

export default function TopicsPage() {
  const { subjectId } = useParams();

  const API_URL = import.meta.env.VITE_API_URL;

  const [topics, setTopics] = useState([]);

  const [editingTopic, setEditingTopic] = useState(null);

  const [deletingTopic, setDeletingTopic] = useState(null);

  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const fetchTopics = async () => {
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
    };

    fetchTopics();
  }, [API_URL, subjectId]);

  const handleAddTopic = async (data) => {
  try {
    const response = await fetch(
      `${API_URL}/api/topics`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subjectId: Number(subjectId),
          name: data.name,
          description: data.description,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to create topic");
    }

    const newTopic = await response.json();

    setTopics((currentTopics) => [
      ...currentTopics,
      newTopic,
    ]);

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
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update topic");
    }

    const updatedTopic = await response.json();

    setTopics((currentTopics) =>
      currentTopics.map((topic) =>
        topic.id === editingTopic.id
          ? updatedTopic
          : topic
      )
    );

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

    setTopics((currentTopics) =>
      currentTopics.filter(
        (topic) => topic.id !== deletingTopic.id
      )
    );

    setDeletingTopic(null);
  } catch (error) {
    console.error("Error deleting topic:", error);
  }
};

const handleToggleCompleted = async (topic) => {
  try {
    const response = await fetch(
      `${API_URL}/api/topics/${topic.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: topic.name,
          description: topic.description,
          completed: !topic.completed,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update topic status");
    }

    const updatedTopic = await response.json();

    setTopics((currentTopics) =>
      currentTopics.map((currentTopic) =>
        currentTopic.id === topic.id
          ? updatedTopic
          : currentTopic
      )
    );
  } catch (error) {
    console.error(
      "Error updating topic status:",
      error
    );
  }
};

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" component="h1">
            Topics
          </Typography>

          <Typography
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Manage topics for this subject.
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

      {/* Topics */}
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
                <Box>
                  <Typography variant="h6">
                    {topic.name}
                  </Typography>

                  <Typography
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    {topic.description}
                  </Typography>
                </Box>
<Checkbox
  checked={topic.completed}
  onChange={() => handleToggleCompleted(topic)}
/>
                <Chip
                  label={
                    topic.completed
                      ? "Completed"
                      : "Not completed"
                  }
                />
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 1,
                  mt: 2,
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
      <AddTopicDialog
  open={dialogOpen}
  onClose={() => setDialogOpen(false)}
  onAdd={handleAddTopic}
/>

<EditTopicDialog
  open={Boolean(editingTopic)}
  onClose={() => setEditingTopic(null)}
  onUpdate={handleUpdateTopic}
  topic={editingTopic}
/>

<DeleteTopicDialog
  open={Boolean(deletingTopic)}
  onClose={() => setDeletingTopic(null)}
  onConfirm={handleDeleteTopic}
  topic={deletingTopic}
/>
    </Box>
  );
}