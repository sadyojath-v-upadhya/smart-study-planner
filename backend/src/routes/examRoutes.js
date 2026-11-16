const express = require("express");

const {
  getExams,
  getExam,
  addExam,
  updateExamData,
  removeExam,
} = require("../controllers/examController");

const router = express.Router();

router.get("/", getExams);
router.get("/:id", getExam);
router.post("/", addExam);
router.put("/:id", updateExamData);
router.delete("/:id", removeExam);

module.exports = router;
