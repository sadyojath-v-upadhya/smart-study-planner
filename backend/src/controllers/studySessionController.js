const {
  getAllStudySessions,
  getStudySessionById,
  getTodayStudySessions,
  createStudySession,
  updateStudySession,
  updateStudySessionStatus,
  deleteStudySession,
} = require("../services/studySessionService");

const VALID_STATUSES = ["Planned", "Completed", "Missed"];

const getStudySessions = async (req, res) => {
  try {
    const { date, status } = req.query;
    const sessions = await getAllStudySessions({ date, status });

    res.json(sessions);
  } catch (error) {
    console.error("Error fetching study sessions:", error.message);

    res.status(500).json({
      message: "Failed to fetch study sessions",
    });
  }
};

const getTodaySessions = async (req, res) => {
  try {
    const sessions = await getTodayStudySessions();

    res.json(sessions);
  } catch (error) {
    console.error("Error fetching today's study sessions:", error.message);

    res.status(500).json({
      message: "Failed to fetch today's study sessions",
    });
  }
};

const getStudySession = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await getStudySessionById(id);

    if (!session) {
      return res.status(404).json({
        message: "Study session not found",
      });
    }

    res.json(session);
  } catch (error) {
    console.error("Error fetching study session:", error.message);

    res.status(500).json({
      message: "Failed to fetch study session",
    });
  }
};

const addStudySession = async (req, res) => {
  try {
    const {
      topicId,
      sessionDate,
      startTime,
      durationMinutes,
      notes = "",
      status = "Planned",
    } = req.body;

    if (!topicId || !sessionDate || !durationMinutes) {
      return res.status(400).json({
        message: "Topic, session date, and duration in minutes are required",
      });
    }

    const parsedDuration = parseInt(durationMinutes, 10);
    if (isNaN(parsedDuration) || parsedDuration <= 0) {
      return res.status(400).json({
        message: "Duration must be a positive integer in minutes",
      });
    }

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        message: "Status must be one of: Planned, Completed, Missed",
      });
    }

    const session = await createStudySession(
      topicId,
      sessionDate,
      startTime || null,
      parsedDuration,
      notes.trim(),
      status
    );

    res.status(201).json(session);
  } catch (error) {
    console.error("Error creating study session:", error.message);

    res.status(500).json({
      message: "Failed to create study session",
    });
  }
};

const updateStudySessionData = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      sessionDate,
      startTime,
      durationMinutes,
      notes = "",
      status = "Planned",
    } = req.body;

    if (!sessionDate || !durationMinutes) {
      return res.status(400).json({
        message: "Session date and duration in minutes are required",
      });
    }

    const parsedDuration = parseInt(durationMinutes, 10);
    if (isNaN(parsedDuration) || parsedDuration <= 0) {
      return res.status(400).json({
        message: "Duration must be a positive integer in minutes",
      });
    }

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        message: "Status must be one of: Planned, Completed, Missed",
      });
    }

    const session = await updateStudySession(
      id,
      sessionDate,
      startTime || null,
      parsedDuration,
      notes.trim(),
      status
    );

    if (!session) {
      return res.status(404).json({
        message: "Study session not found",
      });
    }

    res.json(session);
  } catch (error) {
    console.error("Error updating study session:", error.message);

    res.status(500).json({
      message: "Failed to update study session",
    });
  }
};

const changeSessionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        message: "Status must be one of: Planned, Completed, Missed",
      });
    }

    const session = await updateStudySessionStatus(id, status);

    if (!session) {
      return res.status(404).json({
        message: "Study session not found",
      });
    }

    res.json(session);
  } catch (error) {
    console.error("Error updating study session status:", error.message);

    res.status(500).json({
      message: "Failed to update study session status",
    });
  }
};

const removeStudySession = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await deleteStudySession(id);

    if (!session) {
      return res.status(404).json({
        message: "Study session not found",
      });
    }

    res.json({
      message: "Study session deleted successfully",
      session,
    });
  } catch (error) {
    console.error("Error deleting study session:", error.message);

    res.status(500).json({
      message: "Failed to delete study session",
    });
  }
};

module.exports = {
  getStudySessions,
  getTodaySessions,
  getStudySession,
  addStudySession,
  updateStudySessionData,
  changeSessionStatus,
  removeStudySession,
};
