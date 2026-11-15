import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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

  useEffect(() => {
    if (topic) {
      setName(topic.name);
      setDescription(topic.description);
    }
  }, [topic]);

  const handleSubmit = () => {
    if (!name.trim() || !description.trim()) {
      return;
    }

    onUpdate({
      name: name.trim(),
      description: description.trim(),
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