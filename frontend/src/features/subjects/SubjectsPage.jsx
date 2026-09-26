import { Add } from "@mui/icons-material";
import {
  Box,
  Button,
  Grid,
  Typography,
} from "@mui/material";
import { useState } from "react";

import AddSubjectDialog from "./components/AddSubjectDialog";
import DeleteSubjectDialog from "./components/DeleteSubjectDialog";
import SubjectCard from "./components/SubjectCard";
import { subjects as initialSubjects } from "./subjectsData";

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState(initialSubjects);

  const [dialogOpen, setDialogOpen] = useState(false);

  const [editingSubject, setEditingSubject] = useState(null);

  const [deletingSubject, setDeletingSubject] = useState(null);

  const handleAddSubject = (data) => {
    const newSubject = {
      id: Date.now(),
      name: data.name,
      description: data.description,
      progress: 0,
      topicCount: 0,
    };

    setSubjects((currentSubjects) => [
      ...currentSubjects,
      newSubject,
    ]);
  };

  const handleEditSubject = (subjectId, data) => {
    setSubjects((currentSubjects) =>
      currentSubjects.map((subject) =>
        subject.id === subjectId
          ? {
              ...subject,
              name: data.name,
              description: data.description,
            }
          : subject
      )
    );
  };

  const handleDeleteSubject = () => {
    setSubjects((currentSubjects) =>
      currentSubjects.filter(
        (subject) => subject.id !== deletingSubject.id
      )
    );

    setDeletingSubject(null);
  };

  const handleOpenAddDialog = () => {
    setEditingSubject(null);
    setDialogOpen(true);
  };

  const handleOpenEditDialog = (subject) => {
    setEditingSubject(subject);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingSubject(null);
  };

  const handleSubmitSubject = (data) => {
    if (editingSubject) {
      handleEditSubject(editingSubject.id, data);
    } else {
      handleAddSubject(data);
    }
  };

  return (
    <Box>
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

          <Typography
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
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
              progress={subject.progress}
              topicCount={subject.topicCount}
              onEdit={() => handleOpenEditDialog(subject)}
              onDelete={() => setDeletingSubject(subject)}
            />
          </Grid>
        ))}
      </Grid>

      <AddSubjectDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onAdd={handleSubmitSubject}
        editingSubject={editingSubject}
      />

      <DeleteSubjectDialog
        open={Boolean(deletingSubject)}
        subject={deletingSubject}
        onClose={() => setDeletingSubject(null)}
        onConfirm={handleDeleteSubject}
      />
    </Box>
  );
}