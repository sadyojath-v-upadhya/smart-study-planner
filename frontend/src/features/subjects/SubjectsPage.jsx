import { Add } from "@mui/icons-material";
import {
  Box,
  Button,
  Grid,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import AddSubjectDialog from "./components/AddSubjectDialog";
import DeleteSubjectDialog from "./components/DeleteSubjectDialog";
import SubjectCard from "./components/SubjectCard";
import { API_URL, authFetch } from "../../utils/api";

export default function SubjectsPage() {
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [deletingSubject, setDeletingSubject] = useState(null);

  // Fetch subjects from backend
  const fetchSubjects = async () => {
    try {
      const response = await authFetch(`${API_URL}/api/subjects`);

      if (!response.ok) {
        throw new Error("Failed to fetch subjects");
      }

      const data = await response.json();
      setSubjects(data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  // Fetch subjects when page loads
  useEffect(() => {
    fetchSubjects();
  }, []);

  // Add subject
  const handleAddSubject = async (data) => {
    try {
      const response = await authFetch(`${API_URL}/api/subjects`, {
        method: "POST",
        body: JSON.stringify({
          name: data.name,
          description: data.description,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create subject");
      }

      await response.json();
      await fetchSubjects();
      handleCloseDialog();
    } catch (error) {
      console.error("Error creating subject:", error);
    }
  };

  // Edit subject
  const handleEditSubject = async (subjectId, data) => {
    try {
      const response = await authFetch(`${API_URL}/api/subjects/${subjectId}`, {
        method: "PUT",
        body: JSON.stringify({
          name: data.name,
          description: data.description,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update subject");
      }

      await response.json();
      await fetchSubjects();
      handleCloseDialog();
    } catch (error) {
      console.error("Error updating subject:", error);
    }
  };

  // Delete subject
  const handleDeleteSubject = async () => {
    if (!deletingSubject) {
      return;
    }

    try {
      const response = await authFetch(
        `${API_URL}/api/subjects/${deletingSubject.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete subject");
      }

      await response.json();
      await fetchSubjects();
      setDeletingSubject(null);
    } catch (error) {
      console.error("Error deleting subject:", error);
    }
  };

  // Open Add dialog
  const handleOpenAddDialog = () => {
    setEditingSubject(null);
    setDialogOpen(true);
  };

  // Open Edit dialog
  const handleOpenEditDialog = (subject) => {
    setEditingSubject(subject);
    setDialogOpen(true);
  };

  // Close Add/Edit dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingSubject(null);
  };

  // Decide whether Add or Edit
  const handleSubmitSubject = async (data) => {
    if (editingSubject) {
      await handleEditSubject(editingSubject.id, data);
    } else {
      await handleAddSubject(data);
    }
  };

  return (
    <Box>
      {/* Page Header */}
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
            My Subjects
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Manage your subjects and track your progress.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenAddDialog}
        >
          Add Subject
        </Button>
      </Box>

      {/* Subject Cards */}
      <Grid container spacing={3}>
        {subjects.map((subject) => (
          <Grid
            key={subject.id}
            size={{
              xs: 12,
              sm: 6,
              lg: 4,
            }}
          >
            <SubjectCard
              name={subject.name}
              description={subject.description}
              progress={Number(subject.progress)}
              topicCount={Number(subject.topic_count)}
              onViewTopics={() => navigate(`/subjects/${subject.id}/topics`)}
              onEdit={() => handleOpenEditDialog(subject)}
              onDelete={() => setDeletingSubject(subject)}
            />
          </Grid>
        ))}
      </Grid>

      {/* Add / Edit Dialog */}
      <AddSubjectDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onAdd={handleSubmitSubject}
        editingSubject={editingSubject}
      />

      {/* Delete Dialog */}
      <DeleteSubjectDialog
        open={Boolean(deletingSubject)}
        subject={deletingSubject}
        onClose={() => setDeletingSubject(null)}
        onConfirm={handleDeleteSubject}
      />
    </Box>
  );
}
