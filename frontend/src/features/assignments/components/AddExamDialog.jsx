import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

export default function AddExamDialog({ open, onClose, onAdd }) {
  const API_URL = import.meta.env.VITE_API_URL;

  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState("");
  const [title, setTitle] = useState("");
  const [examDate, setExamDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [startTime, setStartTime] = useState("09:30");
  const [durationMinutes, setDurationMinutes] = useState(120);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      const fetchSubjects = async () => {
        try {
          const res = await fetch(`${API_URL}/api/subjects`);
          if (res.ok) {
            const data = await res.json();
            setSubjects(data);
            if (data.length > 0) setSubjectId(data[0].id);
          }
        } catch (err) {
          console.error("Error fetching subjects for exam:", err);
        }
      };

      fetchSubjects();
      setTitle("");
      setExamDate(new Date().toISOString().split("T")[0]);
      setStartTime("09:30");
      setDurationMinutes(120);
      setNotes("");
      setError("");
      setSubmitting(false);
    }
  }, [open, API_URL]);

  const handleSubmit = async () => {
    if (!subjectId) {
      setError("Please select a subject.");
      return;
    }
    if (!title.trim()) {
      setError("Exam title is required.");
      return;
    }
    if (!examDate) {
      setError("Please select an exam date.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      await onAdd({
        subjectId: Number(subjectId),
        title: title.trim(),
        examDate,
        startTime: startTime || null,
        durationMinutes: durationMinutes ? Number(durationMinutes) : null,
        notes: notes.trim(),
      });
    } catch (err) {
      setError(err.message || "Failed to create exam");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add Examination</DialogTitle>

      <DialogContent>
        {error && (
          <Typography color="error" variant="body2" sx={{ mb: 2, mt: 1 }}>
            {error}
          </Typography>
        )}

        <FormControl fullWidth margin="normal">
          <InputLabel id="exam-subject-label">Subject</InputLabel>
          <Select
            labelId="exam-subject-label"
            value={subjectId}
            label="Subject"
            onChange={(e) => setSubjectId(e.target.value)}
          >
            {subjects.map((sub) => (
              <MenuItem key={sub.id} value={sub.id}>
                {sub.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          fullWidth
          label="Exam Title"
          placeholder="e.g., Midterm Theory Examination"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          margin="normal"
        />

        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            fullWidth
            label="Exam Date"
            type="date"
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            fullWidth
            label="Start Time"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
        </Box>

        <TextField
          fullWidth
          label="Duration (minutes)"
          type="number"
          value={durationMinutes}
          onChange={(e) => setDurationMinutes(e.target.value)}
          margin="normal"
          inputProps={{ min: 10, step: 10 }}
        />

        <TextField
          fullWidth
          label="Syllabus / Preparation Notes"
          placeholder="e.g., Units 1, 2, and 3. Bring scientific calculator."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          margin="normal"
          multiline
          rows={3}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? "Adding..." : "Add Exam"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
