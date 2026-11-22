import {
  AccessTime,
  Add,
  CalendarToday,
  CheckCircle,
  Delete,
  MenuBook,
  RadioButtonUnchecked,
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
import { useLocation } from "react-router-dom";
import AddSessionDialog from "./components/AddSessionDialog";
import { API_URL, authFetch } from "../../utils/api";

const getDifficultyColor = (difficulty) => {
  switch (difficulty) {
    case "Easy":
      return "success";
    case "Hard":
      return "error";
    case "Medium":
    default:
      return "warning";
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case "Completed":
      return "success";
    case "Missed":
      return "error";
    case "Planned":
    default:
      return "primary";
  }
};

const formatTime = (timeStr) => {
  if (!timeStr) return "";
  const [hours, minutes] = timeStr.split(":");
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const formattedHours = h % 12 || 12;
  return `${formattedHours}:${minutes} ${ampm}`;
};

export default function PlannerPage() {
  const API_URL = import.meta.env.VITE_API_URL;
  const location = useLocation();

  const [sessions, setSessions] = useState([]);
  const [filter, setFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [prefillData, setPrefillData] = useState(null);

  // Check if routed from Intelligent Recommendations with prefilled topic
  useEffect(() => {
    if (location.state?.prefill) {
      setPrefillData(location.state.prefill);
      setDialogOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const fetchSessions = useCallback(async () => {
    try {
      const res = await authFetch(`${API_URL}/api/study-sessions`);
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch (err) {
      console.error("Error fetching study sessions:", err);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleAddSession = async (sessionData) => {
    const res = await authFetch(`${API_URL}/api/study-sessions`, {
      method: "POST",
      body: JSON.stringify(sessionData),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || "Failed to create study session");
    }

    await fetchSessions();
    setDialogOpen(false);
    setPrefillData(null);
  };

  const handleToggleStatus = async (session) => {
    const nextStatus =
      session.status === "Completed" ? "Planned" : "Completed";

    try {
      const res = await authFetch(
        `${API_URL}/api/study-sessions/${session.id}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status: nextStatus }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to update session status");
      }

      await fetchSessions();
    } catch (err) {
      console.error("Error updating session status:", err);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    try {
      const res = await authFetch(`${API_URL}/api/study-sessions/${sessionId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete study session");
      }

      await fetchSessions();
    } catch (err) {
      console.error("Error deleting study session:", err);
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];

  const filteredSessions = sessions.filter((s) => {
    if (filter === "today") {
      return s.session_date === todayStr;
    }
    if (filter === "upcoming") {
      return s.session_date >= todayStr && s.status === "Planned";
    }
    if (filter === "completed") {
      return s.status === "Completed";
    }
    return true;
  });

  return (
    <Box>
      {/* Header */}
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
            Study Planner
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Schedule focused study blocks, prioritize topics, and track your daily sessions.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setPrefillData(null);
            setDialogOpen(true);
          }}
        >
          Schedule Session
        </Button>
      </Box>

      {/* Filter Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={filter}
          onChange={(e, val) => setFilter(val)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label={`All (${sessions.length})`} value="all" />
          <Tab
            label={`Today (${
              sessions.filter((s) => s.session_date === todayStr).length
            })`}
            value="today"
          />
          <Tab
            label={`Upcoming (${
              sessions.filter(
                (s) => s.session_date >= todayStr && s.status === "Planned"
              ).length
            })`}
            value="upcoming"
          />
          <Tab
            label={`Completed (${
              sessions.filter((s) => s.status === "Completed").length
            })`}
            value="completed"
          />
        </Tabs>
      </Box>

      {/* Sessions Content */}
      {filteredSessions.length === 0 ? (
        <Card sx={{ p: 4, textAlign: "center", bgcolor: "background.default" }}>
          <Typography variant="h6" color="text.secondary">
            No study sessions found.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
            {filter === "today"
              ? "You have no sessions scheduled for today. Take a break or plan one!"
              : "Plan your study blocks ahead of time to stay disciplined."}
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setPrefillData(null);
              setDialogOpen(true);
            }}
          >
            Schedule a Session
          </Button>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {filteredSessions.map((session) => (
            <Grid key={session.id} size={{ xs: 12, md: 6 }}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  borderLeft: 4,
                  borderColor:
                    session.status === "Completed"
                      ? "success.main"
                      : "primary.main",
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  {/* Subject and Status Chips */}
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
                        {session.subject_name}
                      </Typography>
                    </Box>

                    <Chip
                      label={session.status}
                      color={getStatusColor(session.status)}
                      size="small"
                      variant={session.status === "Planned" ? "outlined" : "filled"}
                    />
                  </Box>

                  {/* Topic Title */}
                  <Typography
                    variant="h6"
                    component="h3"
                    sx={{
                      textDecoration:
                        session.status === "Completed"
                          ? "line-through"
                          : "none",
                      color:
                        session.status === "Completed"
                          ? "text.secondary"
                          : "text.primary",
                    }}
                  >
                    {session.topic_name}
                  </Typography>

                  {/* Metadata Chips: Date, Time, Duration, Difficulty */}
                  <Stack
                    direction="row"
                    spacing={1}
                    flexWrap="wrap"
                    useFlexGap
                    sx={{ mt: 1.5, mb: 1.5 }}
                  >
                    <Chip
                      icon={<CalendarToday fontSize="small" />}
                      label={session.session_date}
                      size="small"
                      variant="outlined"
                    />

                    {session.start_time && (
                      <Chip
                        icon={<AccessTime fontSize="small" />}
                        label={formatTime(session.start_time)}
                        size="small"
                        variant="outlined"
                      />
                    )}

                    <Chip
                      label={`${session.duration_minutes} mins`}
                      size="small"
                      variant="outlined"
                    />

                    <Chip
                      label={session.topic_difficulty}
                      color={getDifficultyColor(session.topic_difficulty)}
                      size="small"
                      variant="outlined"
                    />
                  </Stack>

                  {/* Optional Notes */}
                  {session.notes && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        fontStyle: "italic",
                        bgcolor: "action.hover",
                        p: 1,
                        borderRadius: 1,
                        mt: 1,
                      }}
                    >
                      "{session.notes}"
                    </Typography>
                  )}

                  {/* Actions */}
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
                        session.status === "Completed" ? (
                          <CheckCircle color="success" />
                        ) : (
                          <RadioButtonUnchecked />
                        )
                      }
                      onClick={() => handleToggleStatus(session)}
                    >
                      {session.status === "Completed"
                        ? "Completed"
                        : "Mark Done"}
                    </Button>

                    <Button
                      size="small"
                      color="error"
                      startIcon={<Delete />}
                      onClick={() => handleDeleteSession(session.id)}
                    >
                      Delete
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add Session Dialog */}
      <AddSessionDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setPrefillData(null);
        }}
        onAdd={handleAddSession}
        prefill={prefillData}
      />
    </Box>
  );
}
