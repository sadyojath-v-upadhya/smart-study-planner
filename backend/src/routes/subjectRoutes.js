const express = require("express");

const {
  getSubjects,
  getSubject,
  addSubject,
  updateSubjectData,
  removeSubject,
} = require("../controllers/subjectController");

const router = express.Router();

router.get("/", getSubjects);
router.get("/:id", getSubject);
router.post("/", addSubject);
router.put("/:id", updateSubjectData);
router.delete("/:id", removeSubject);

module.exports = router;