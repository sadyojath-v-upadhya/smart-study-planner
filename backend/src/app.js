const express = require("express");
const cors = require("cors");

const subjectRoutes = require("./routes/subjectRoutes");
const topicRoutes = require("./routes/topicRoutes");
const studySessionRoutes = require("./routes/studySessionRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/subjects", subjectRoutes);
app.use("/api/topics", topicRoutes);
app.use("/api/study-sessions", studySessionRoutes);

app.get("/", (req, res) => {
  res.send("Smart Study Planner backend is running!");
});

app.use((req, res) => {
  res.status(404).json({
    message: "API endpoint not found",
  });
});

module.exports = app;
