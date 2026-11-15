import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";

export default function AddTopicDialog({
  open,
  onClose,
  onAdd,
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (open) {
      setName("");
      setDescription("");
    }
  }, [open]);

  const handleSubmit = () => {
    if (!name.trim() || !description.trim()) {
      return;
    }

    onAdd({
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
      <DialogTitle>Add Topic</DialogTitle>

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
          Add Topic
        </Button>
      </DialogActions>
    </Dialog>
  );
}