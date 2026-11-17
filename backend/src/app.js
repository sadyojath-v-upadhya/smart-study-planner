const express = require("express");
const cors = require("cors");

const subjectRoutes = require("./routes/subjectRoutes");
const topicRoutes = require("./routes/topicRoutes");
const studySessionRoutes = require("./routes/studySessionRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");
const examRoutes = require("./routes/examRoutes");
const deadlineRoutes = require("./routes/deadlineRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/subjects", subjectRoutes);
app.use("/api/topics", topicRoutes);
app.use("/api/study-sessions", studySessionRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/deadlines", deadlineRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/recommendations", recommendationRoutes);

app.get("/", (req, res) => {
  res.send("Smart Study Planner backend is running!");
});

app.use((req, res) => {
  res.status(404).json({
    message: "API endpoint not found",
  });
});

module.exports = app;
