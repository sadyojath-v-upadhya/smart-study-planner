import {
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
import { API_URL, authFetch } from "../../../utils/api";

export default function AddAssignmentDialog({ open, onClose, onAdd }) {
  const API_URL = import.meta.env.VITE_API_URL;

  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [priority, setPriority] = useState("Medium");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      const fetchSubjects = async () => {
        try {
          const res = await authFetch(`${API_URL}/api/subjects`);
          if (res.ok) {
            const data = await res.json();
            setSubjects(data);
            if (data.length > 0) {
              setSubjectId(data[0].id);
            }
          }
        } catch (err) {
          console.error("Error fetching subjects for assignment:", err);
        }
      };

      fetchSubjects();
      setTitle("");
      setDescription("");
      setDueDate(new Date().toISOString().split("T")[0]);
      setPriority("Medium");
      setError("");
      setSubmitting(false);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!subjectId) {
      setError("Please select a subject.");
      return;
    }
    if (!title.trim()) {
      setError("Assignment title is required.");
      return;
    }
    if (!dueDate) {
      setError("Please select a due date.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      await onAdd({
        subjectId: Number(subjectId),
        title: title.trim(),
        description: description.trim(),
        dueDate,
        priority,
        status: "Pending",
      });
    } catch (err) {
      setError(err.message || "Failed to add assignment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add Assignment</DialogTitle>

      <DialogContent>
        {error && (
          <Typography color="error" variant="body2" sx={{ mb: 2, mt: 1 }}>
            {error}
          </Typography>
        )}

        <FormControl fullWidth margin="normal">
          <InputLabel id="assign-subject-label">Subject</InputLabel>
          <Select
            labelId="assign-subject-label"
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
          label="Assignment Title"
          placeholder="e.g., Lab Report on Process Scheduling"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          margin="normal"
        />

        <TextField
          fullWidth
          label="Description / Requirements"
          placeholder="e.g., Implement Round Robin and FCFS, write comparison analysis."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          margin="normal"
          multiline
          rows={3}
        />

        <TextField
          fullWidth
          label="Due Date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          margin="normal"
          InputLabelProps={{ shrink: true }}
        />

        <FormControl fullWidth margin="normal">
          <InputLabel id="assign-priority-label">Priority</InputLabel>
          <Select
            labelId="assign-priority-label"
            value={priority}
            label="Priority"
            onChange={(e) => setPriority(e.target.value)}
          >
            <MenuItem value="Low">Low</MenuItem>
            <MenuItem value="Medium">Medium</MenuItem>
            <MenuItem value="High">High</MenuItem>
          </Select>
        </FormControl>
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
          {submitting ? "Adding..." : "Add Assignment"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
