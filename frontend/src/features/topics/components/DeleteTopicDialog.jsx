import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";

export default function DeleteTopicDialog({
  open,
  onClose,
  onConfirm,
  topic,
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>Delete Topic</DialogTitle>

      <DialogContent>
        <Typography>
          Are you sure you want to delete{" "}
          <strong>{topic?.name}</strong>?
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Cancel
        </Button>

        <Button
          color="error"
          variant="contained"
          onClick={onConfirm}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}