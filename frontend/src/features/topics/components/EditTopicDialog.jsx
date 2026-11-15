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
} from "@mui/material";
import { useEffect, useState } from "react";

export default function EditTopicDialog({
  open,
  onClose,
  onUpdate,
  topic,
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");

  useEffect(() => {
    if (topic) {
      setName(topic.name);
      setDescription(topic.description);
      setDifficulty(topic.difficulty || "Medium");
    }
  }, [topic]);

  const handleSubmit = () => {
    if (!name.trim() || !description.trim()) {
      return;
    }

    onUpdate({
      name: name.trim(),
      description: description.trim(),
      difficulty,
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Edit Topic</DialogTitle>

      <DialogContent>
        <TextField
          fullWidth
          label="Topic Name"
          value={name}
          onChange={(event) =>
            setName(event.target.value)
          }
          margin="normal"
        />

        <TextField
          fullWidth
          label="Description"
          value={description}
          onChange={(event) =>
            setDescription(event.target.value)
          }
          margin="normal"
          multiline
          rows={3}
        />

        <FormControl fullWidth margin="normal">
          <InputLabel id="edit-topic-difficulty-label">Difficulty</InputLabel>
          <Select
            labelId="edit-topic-difficulty-label"
            value={difficulty}
            label="Difficulty"
            onChange={(event) => setDifficulty(event.target.value)}
          >
            <MenuItem value="Easy">Easy</MenuItem>
            <MenuItem value="Medium">Medium</MenuItem>
            <MenuItem value="Hard">Hard</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}
