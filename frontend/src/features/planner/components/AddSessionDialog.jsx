import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

const DURATION_PRESETS = [30, 45, 60, 90, 120];

export default function AddSessionDialog({
  open,
  onClose,
  onAdd,
  prefill = null,
}) {
  const API_URL = import.meta.env.VITE_API_URL;

  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);

  const [subjectId, setSubjectId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [sessionDate, setSessionDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [startTime, setStartTime] = useState("16:00");
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch subjects when dialog opens
  useEffect(() => {
    if (open) {
      const fetchSubjects = async () => {
        try {
          const res = await fetch(`${API_URL}/api/subjects`);
          if (res.ok) {
            const data = await res.json();
            setSubjects(data);
            if (prefill?.subjectId) {
              setSubjectId(prefill.subjectId);
            }
          }
        } catch (err) {
          console.error("Error fetching subjects for planner:", err);
        }
      };

      fetchSubjects();
      setSubjectId(prefill?.subjectId || "");
      setTopicId(prefill?.topicId || "");
      setDurationMinutes(prefill?.recommendedDuration || 45);
      setNotes(
        prefill?.primaryReason ? `Focus: ${prefill.primaryReason}` : ""
      );
      setSessionDate(new Date().toISOString().split("T")[0]);
      setStartTime("16:00");
      setError("");
      setSubmitting(false);
    }
  }, [open, prefill, API_URL]);

  // Fetch topics whenever selected subject changes
  useEffect(() => {
    if (!subjectId) {
      setTopics([]);
      setTopicId("");
      return;
    }

    const fetchTopics = async () => {
      try {
        const res = await fetch(`${API_URL}/api/topics/subject/${subjectId}`);
        if (res.ok) {
          const data = await res.json();
          setTopics(data);
          if (data.length > 0) {
            if (
              prefill &&
              prefill.topicId &&
              Number(prefill.subjectId) === Number(subjectId)
            ) {
              setTopicId(prefill.topicId);
            } else {
              const pendingTopic = data.find((t) => !t.completed);
              setTopicId(pendingTopic ? pendingTopic.id : data[0].id);
            }
          } else {
            setTopicId("");
          }
        }
      } catch (err) {
        console.error("Error fetching topics for subject:", err);
      }
    };

    fetchTopics();
  }, [subjectId, prefill, API_URL]);

  const handleSubmit = async () => {
    if (!subjectId) {
      setError("Please select a subject.");
      return;
    }
    if (!topicId) {
      setError("Please select a topic to study.");
      return;
    }
    if (!sessionDate) {
      setError("Please select a session date.");
      return;
    }
    if (!durationMinutes || Number(durationMinutes) <= 0) {
      setError("Please enter a valid study duration in minutes.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      await onAdd({
        topicId: Number(topicId),
        sessionDate,
        startTime: startTime || null,
        durationMinutes: Number(durationMinutes),
        notes: notes.trim(),
      });
    } catch (err) {
      setError(err.message || "Failed to schedule session");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Schedule Study Session</DialogTitle>

      <DialogContent>
        {error && (
          <Typography color="error" variant="body2" sx={{ mb: 2, mt: 1 }}>
            {error}
          </Typography>
        )}

        {/* Subject Selection */}
        <FormControl fullWidth margin="normal">
          <InputLabel id="session-subject-label">Subject</InputLabel>
          <Select
            labelId="session-subject-label"
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

        {/* Topic Selection */}
        <FormControl fullWidth margin="normal" disabled={!subjectId}>
          <InputLabel id="session-topic-label">Topic</InputLabel>
          <Select
            labelId="session-topic-label"
            value={topicId}
            label="Topic"
            onChange={(e) => setTopicId(e.target.value)}
          >
            {topics.length === 0 ? (
              <MenuItem value="" disabled>
                {subjectId
                  ? "No topics found for this subject"
                  : "Select a subject first"}
              </MenuItem>
            ) : (
              topics.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.name} ({t.difficulty}) {t.completed ? "✓ Done" : ""}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>

        {/* Date and Time Fields */}
        <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
          <TextField
            fullWidth
            label="Session Date"
            type="date"
            value={sessionDate}
            onChange={(e) => setSessionDate(e.target.value)}
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

        {/* Duration with presets */}
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Duration (minutes)"
            type="number"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value)}
            margin="normal"
            inputProps={{ min: 5, step: 5 }}
          />

          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            {DURATION_PRESETS.map((preset) => (
              <Chip
                key={preset}
                label={`${preset}m`}
                clickable
                color={durationMinutes === preset ? "primary" : "default"}
                onClick={() => setDurationMinutes(preset)}
                size="small"
              />
            ))}
          </Stack>
        </Box>

        {/* Study Notes / Goals */}
        <TextField
          fullWidth
          label="Study Goal / Notes (optional)"
          placeholder="e.g., Read pages 40-55 and complete exercise 3"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          margin="normal"
          multiline
          rows={2}
          sx={{ mt: 2 }}
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
          {submitting ? "Scheduling..." : "Schedule Session"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
