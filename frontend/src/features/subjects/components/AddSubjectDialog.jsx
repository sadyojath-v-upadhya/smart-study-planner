import { useEffect } from "react";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";

import { Controller, useForm } from "react-hook-form";

export default function AddSubjectDialog({
  open,
  onClose,
  onAdd,
  editingSubject,
}) {
  const {
    control,
    handleSubmit,
    reset,
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (editingSubject) {
      reset({
        name: editingSubject.name,
        description: editingSubject.description,
      });
    } else {
      reset({
        name: "",
        description: "",
      });
    }
  }, [editingSubject, reset]);

  const submitForm = async (data) => {
    await onAdd(data);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        {editingSubject
          ? "Edit Subject"
          : "Add Subject"}
      </DialogTitle>

      <DialogContent>
        <Controller
          name="name"
          control={control}
          rules={{
            required: "Subject name is required",
            minLength: {
              value: 2,
              message:
                "Subject name must be at least 2 characters",
            },
          }}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Subject Name"
              fullWidth
              autoFocus
              margin="normal"
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
            />
          )}
        />

        <Controller
          name="description"
          control={control}
          rules={{
            required: "Description is required",
            minLength: {
              value: 5,
              message:
                "Description must be at least 5 characters",
            },
          }}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Description"
              fullWidth
              multiline
              rows={3}
              margin="normal"
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
            />
          )}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit(submitForm)}
        >
          {editingSubject
            ? "Save Changes"
            : "Add Subject"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}