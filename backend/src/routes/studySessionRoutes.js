const express = require("express");

const {
  getStudySessions,
  getTodaySessions,
  getStudySession,
  addStudySession,
  updateStudySessionData,
  changeSessionStatus,
  removeStudySession,
} = require("../controllers/studySessionController");

const router = express.Router();

router.get("/", getStudySessions);
router.get("/today", getTodaySessions);
router.get("/:id", getStudySession);
router.post("/", addStudySession);
router.put("/:id", updateStudySessionData);
router.patch("/:id/status", changeSessionStatus);
router.delete("/:id", removeStudySession);

module.exports = router;
