const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const subjectRoutes = require("./routes/subjectRoutes");
const topicRoutes = require("./routes/topicRoutes");
const studySessionRoutes = require("./routes/studySessionRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");
const examRoutes = require("./routes/examRoutes");
const deadlineRoutes = require("./routes/deadlineRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");
const authenticateToken = require("./middleware/authMiddleware");

const app = express();

app.use(cors());
app.use(express.json());

// Public Auth routes (register, login)
app.use("/api/auth", authRoutes);

// Protected routes requiring valid JWT token
app.use("/api/subjects", authenticateToken, subjectRoutes);
app.use("/api/topics", authenticateToken, topicRoutes);
app.use("/api/study-sessions", authenticateToken, studySessionRoutes);
app.use("/api/assignments", authenticateToken, assignmentRoutes);
app.use("/api/exams", authenticateToken, examRoutes);
app.use("/api/deadlines", authenticateToken, deadlineRoutes);
app.use("/api/analytics", authenticateToken, analyticsRoutes);
app.use("/api/recommendations", authenticateToken, recommendationRoutes);

app.get("/", (req, res) => {
  res.send("Smart Study Planner backend is running!");
});

app.use((req, res) => {
  res.status(404).json({
    message: "API endpoint not found",
  });
});

module.exports = app;
