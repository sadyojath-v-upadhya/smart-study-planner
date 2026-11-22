import {
  AccessTime,
  Add,
  AssignmentTurnedIn,
  CalendarToday,
  CheckCircle,
  Delete,
  HourglassEmpty,
  MenuBook,
  School,
  WarningAmber,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import AddAssignmentDialog from "./components/AddAssignmentDialog";
import AddExamDialog from "./components/AddExamDialog";
import { API_URL, authFetch } from "../../utils/api";

const getPriorityColor = (priority) => {
  switch (priority) {
    case "High":
      return "error";
    case "Low":
      return "success";
    case "Medium":
    default:
      return "warning";
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case "Completed":
      return "success";
    case "In Progress":
      return "info";
    case "Pending":
    default:
      return "default";
  }
};

const getDaysLeftBadge = (daysLeft) => {
  const d = Number(daysLeft);
  if (d < 0) {
    return { label: `${Math.abs(d)}d overdue`, color: "error" };
  }
  if (d === 0) {
    return { label: "Due Today", color: "error" };
  }
  if (d === 1) {
    return { label: "Tomorrow", color: "warning" };
  }
  if (d <= 5) {
    return { label: `In ${d} days`, color: "warning" };
  }
  return { label: `In ${d} days`, color: "default" };
};

const formatTime = (timeStr) => {
  if (!timeStr) return "";
  const [hours, minutes] = timeStr.split(":");
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const formattedHours = h % 12 || 12;
  return `${formattedHours}:${minutes} ${ampm}`;
};

export default function AssignmentsPage() {
  const API_URL = import.meta.env.VITE_API_URL;

  const [currentTab, setCurrentTab] = useState(0);
  const [assignments, setAssignments] = useState([]);
  const [exams, setExams] = useState([]);
  const [deadlines, setDeadlines] = useState([]);

  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [examDialogOpen, setExamDialogOpen] = useState(false);

  const fetchAssignments = useCallback(async () => {
    try {
      const res = await authFetch(`${API_URL}/api/assignments`);
      if (res.ok) {
        const data = await res.json();
        setAssignments(data);
      }
    } catch (err) {
      console.error("Error fetching assignments:", err);
    }
  }, []);

  const fetchExams = useCallback(async () => {
    try {
      const res = await authFetch(`${API_URL}/api/exams`);
      if (res.ok) {
        const data = await res.json();
        setExams(data);
      }
    } catch (err) {
      console.error("Error fetching exams:", err);
    }
  }, []);

  const fetchDeadlines = useCallback(async () => {
    try {
      const res = await authFetch(`${API_URL}/api/deadlines/upcoming`);
      if (res.ok) {
        const data = await res.json();
        setDeadlines(data);
      }
    } catch (err) {
      console.error("Error fetching upcoming deadlines:", err);
    }
  }, []);

  useEffect(() => {
    fetchAssignments();
    fetchExams();
    fetchDeadlines();
  }, [fetchAssignments, fetchExams, fetchDeadlines]);

  // Assignment Actions
  const handleAddAssignment = async (payload) => {
    const res = await authFetch(`${API_URL}/api/assignments`, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(
        errData.message ||
          `Server returned status ${res.status}. Make sure the backend server is running and restarted.`
      );
    }

    await fetchAssignments();
    await fetchDeadlines();
    setAssignmentDialogOpen(false);
  };

  const handleCycleAssignmentStatus = async (assignment) => {
    const nextStatus =
      assignment.status === "Pending"
        ? "In Progress"
        : assignment.status === "In Progress"
        ? "Completed"
        : "Pending";

    try {
      const res = await authFetch(
        `${API_URL}/api/assignments/${assignment.id}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status: nextStatus }),
        }
      );
      if (res.ok) {
        await fetchAssignments();
        await fetchDeadlines();
      }
    } catch (err) {
      console.error("Error updating assignment status:", err);
    }
  };

  const handleDeleteAssignment = async (id) => {
    try {
      const res = await authFetch(`${API_URL}/api/assignments/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchAssignments();
        await fetchDeadlines();
      }
    } catch (err) {
      console.error("Error deleting assignment:", err);
    }
  };

  // Exam Actions
  const handleAddExam = async (payload) => {
    const res = await authFetch(`${API_URL}/api/exams`, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(
        errData.message ||
          `Server returned status ${res.status}. Make sure the backend server is running and restarted.`
      );
    }

    await fetchExams();
    await fetchDeadlines();
    setExamDialogOpen(false);
  };

  const handleDeleteExam = async (id) => {
    try {
      const res = await authFetch(`${API_URL}/api/exams/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchExams();
        await fetchDeadlines();
      }
    } catch (err) {
      console.error("Error deleting exam:", err);
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
          mb: 3,
          flexWrap: "wrap",
        }}
      >
        <Box>
          <Typography variant="h4" component="h1">
            Tasks & Examinations
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Manage coursework assignments, track examination schedules, and stay ahead of deadlines.
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<School />}
            onClick={() => setExamDialogOpen(true)}
          >
            Add Exam
          </Button>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setAssignmentDialogOpen(true)}
          >
            Add Assignment
          </Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={(e, val) => setCurrentTab(val)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab
            label={`Assignments (${assignments.length})`}
            icon={<AssignmentTurnedIn fontSize="small" />}
            iconPosition="start"
          />
          <Tab
            label={`Examinations (${exams.length})`}
            icon={<School fontSize="small" />}
            iconPosition="start"
          />
          <Tab
            label={`Upcoming Deadlines (${deadlines.length})`}
            icon={<WarningAmber fontSize="small" />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* TAB 0: ASSIGNMENTS */}
      {currentTab === 0 && (
        <Box>
          {assignments.length === 0 ? (
            <Card sx={{ p: 4, textAlign: "center", bgcolor: "background.default" }}>
              <Typography variant="h6" color="text.secondary">
                No assignments added yet.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                Track your upcoming assignment due dates, lab submissions, and coursework.
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setAssignmentDialogOpen(true)}
              >
                Add Your First Assignment
              </Button>
            </Card>
          ) : (
            <Grid container spacing={2}>
              {assignments.map((assignment) => {
                const badge = getDaysLeftBadge(assignment.days_left);
                return (
                  <Grid key={assignment.id} size={{ xs: 12, md: 6 }}>
                    <Card
                      sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        borderLeft: 4,
                        borderColor:
                          assignment.status === "Completed"
                            ? "success.main"
                            : assignment.priority === "High"
                            ? "error.main"
                            : "primary.main",
                      }}
                    >
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 1.5,
                            gap: 1,
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <MenuBook fontSize="small" color="primary" />
                            <Typography
                              variant="caption"
                              fontWeight={700}
                              color="primary"
                              sx={{ textTransform: "uppercase" }}
                            >
                              {assignment.subject_name}
                            </Typography>
                          </Box>

                          <Box sx={{ display: "flex", gap: 1 }}>
                            <Chip
                              label={badge.label}
                              color={badge.color}
                              size="small"
                            />
                            <Chip
                              label={assignment.priority}
                              color={getPriorityColor(assignment.priority)}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                        </Box>

                        <Typography
                          variant="h6"
                          component="h3"
                          sx={{
                            textDecoration:
                              assignment.status === "Completed"
                                ? "line-through"
                                : "none",
                            color:
                              assignment.status === "Completed"
                                ? "text.secondary"
                                : "text.primary",
                          }}
                        >
                          {assignment.title}
                        </Typography>

                        {assignment.description && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 0.5, mb: 1.5 }}
                          >
                            {assignment.description}
                          </Typography>
                        )}

                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{ mt: 1, mb: 1.5 }}
                        >
                          <Chip
                            icon={<CalendarToday fontSize="small" />}
                            label={`Due: ${assignment.due_date}`}
                            size="small"
                            variant="outlined"
                          />
                          <Chip
                            label={assignment.status}
                            color={getStatusColor(assignment.status)}
                            size="small"
                          />
                        </Stack>

                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mt: 2,
                            pt: 1,
                            borderTop: 1,
                            borderColor: "divider",
                          }}
                        >
                          <Button
                            size="small"
                            startIcon={
                              assignment.status === "Completed" ? (
                                <CheckCircle color="success" />
                              ) : (
                                <HourglassEmpty />
                              )
                            }
                            onClick={() =>
                              handleCycleAssignmentStatus(assignment)
                            }
                          >
                            Status: {assignment.status} (Click to change)
                          </Button>

                          <Button
                            size="small"
                            color="error"
                            startIcon={<Delete />}
                            onClick={() =>
                              handleDeleteAssignment(assignment.id)
                            }
                          >
                            Delete
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Box>
      )}

      {/* TAB 1: EXAMINATIONS */}
      {currentTab === 1 && (
        <Box>
          {exams.length === 0 ? (
            <Card sx={{ p: 4, textAlign: "center", bgcolor: "background.default" }}>
              <Typography variant="h6" color="text.secondary">
                No examinations scheduled yet.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                Keep track of midterms, lab tests, and final semester exams.
              </Typography>
              <Button
                variant="contained"
                startIcon={<School />}
                onClick={() => setExamDialogOpen(true)}
              >
                Add Examination
              </Button>
            </Card>
          ) : (
            <Grid container spacing={2}>
              {exams.map((exam) => {
                const badge = getDaysLeftBadge(exam.days_left);
                return (
                  <Grid key={exam.id} size={{ xs: 12, md: 6 }}>
                    <Card
                      sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        borderLeft: 4,
                        borderColor: "secondary.main",
                      }}
                    >
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 1.5,
                            gap: 1,
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <MenuBook fontSize="small" color="secondary" />
                            <Typography
                              variant="caption"
                              fontWeight={700}
                              color="secondary"
                              sx={{ textTransform: "uppercase" }}
                            >
                              {exam.subject_name}
                            </Typography>
                          </Box>

                          <Chip
                            label={badge.label}
                            color={badge.color}
                            size="small"
                          />
                        </Box>

                        <Typography variant="h6" component="h3">
                          {exam.title}
                        </Typography>

                        <Stack
                          direction="row"
                          spacing={1}
                          flexWrap="wrap"
                          useFlexGap
                          sx={{ mt: 1.5, mb: 1.5 }}
                        >
                          <Chip
                            icon={<CalendarToday fontSize="small" />}
                            label={exam.exam_date}
                            size="small"
                            variant="outlined"
                          />

                          {exam.start_time && (
                            <Chip
                              icon={<AccessTime fontSize="small" />}
                              label={formatTime(exam.start_time)}
                              size="small"
                              variant="outlined"
                            />
                          )}

                          {exam.duration_minutes && (
                            <Chip
                              label={`${exam.duration_minutes} mins`}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Stack>

                        {exam.notes && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              bgcolor: "action.hover",
                              p: 1,
                              borderRadius: 1,
                              mt: 1,
                            }}
                          >
                            <strong>Syllabus / Notes:</strong> {exam.notes}
                          </Typography>
                        )}

                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            mt: 2,
                            pt: 1,
                            borderTop: 1,
                            borderColor: "divider",
                          }}
                        >
                          <Button
                            size="small"
                            color="error"
                            startIcon={<Delete />}
                            onClick={() => handleDeleteExam(exam.id)}
                          >
                            Delete
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Box>
      )}

      {/* TAB 2: UNIFIED UPCOMING DEADLINES */}
      {currentTab === 2 && (
        <Box>
          {deadlines.length === 0 ? (
            <Card sx={{ p: 4, textAlign: "center", bgcolor: "background.default" }}>
              <Typography variant="h6" color="text.secondary">
                No upcoming deadlines!
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                All assignments are completed and no upcoming exams are scheduled. Great job!
              </Typography>
            </Card>
          ) : (
            <Stack spacing={2}>
              {deadlines.map((item) => {
                const badge = getDaysLeftBadge(item.days_left);
                const isExam = item.type === "exam";

                return (
                  <Card
                    key={`${item.type}-${item.id}`}
                    sx={{
                      p: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderLeft: 4,
                      borderColor: isExam ? "secondary.main" : "primary.main",
                      gap: 2,
                    }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 0.5,
                        }}
                      >
                        <Chip
                          label={isExam ? "Exam" : "Assignment"}
                          color={isExam ? "secondary" : "primary"}
                          size="small"
                        />
                        <Typography
                          variant="caption"
                          fontWeight={600}
                          color="text.secondary"
                        >
                          {item.subject_name}
                        </Typography>
                      </Box>

                      <Typography variant="subtitle1" fontWeight={600} noWrap>
                        {item.title}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        Deadline: {item.deadline_date}
                      </Typography>
                    </Box>

                    <Chip
                      label={badge.label}
                      color={badge.color}
                      size="medium"
                      variant="filled"
                    />
                  </Card>
                );
              })}
            </Stack>
          )}
        </Box>
      )}

      {/* Dialogs */}
      <AddAssignmentDialog
        open={assignmentDialogOpen}
        onClose={() => setAssignmentDialogOpen(false)}
        onAdd={handleAddAssignment}
      />

      <AddExamDialog
        open={examDialogOpen}
        onClose={() => setExamDialogOpen(false)}
        onAdd={handleAddExam}
      />
    </Box>
  );
}
