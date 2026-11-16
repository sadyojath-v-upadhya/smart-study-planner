const express = require("express");

const {
  getAssignments,
  getAssignment,
  addAssignment,
  updateAssignmentData,
  changeAssignmentStatus,
  removeAssignment,
} = require("../controllers/assignmentController");

const router = express.Router();

router.get("/", getAssignments);
router.get("/:id", getAssignment);
router.post("/", addAssignment);
router.put("/:id", updateAssignmentData);
router.patch("/:id/status", changeAssignmentStatus);
router.delete("/:id", removeAssignment);

module.exports = router;
