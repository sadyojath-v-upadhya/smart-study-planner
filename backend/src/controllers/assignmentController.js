const {
  getAllAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  updateAssignmentStatus,
  deleteAssignment,
} = require("../services/assignmentService");

const VALID_PRIORITIES = ["Low", "Medium", "High"];
const VALID_STATUSES = ["Pending", "In Progress", "Completed"];

const getAssignments = async (req, res) => {
  try {
    const { subjectId, status, priority } = req.query;
    const assignments = await getAllAssignments({
      subjectId: subjectId ? Number(subjectId) : undefined,
      status,
      priority,
    });

    res.json(assignments);
  } catch (error) {
    console.error("Error fetching assignments:", error.message);

    res.status(500).json({
      message: "Failed to fetch assignments",
    });
  }
};

const getAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const assignment = await getAssignmentById(id);

    if (!assignment) {
      return res.status(404).json({
        message: "Assignment not found",
      });
    }

    res.json(assignment);
  } catch (error) {
    console.error("Error fetching assignment:", error.message);

    res.status(500).json({
      message: "Failed to fetch assignment",
    });
  }
};

const addAssignment = async (req, res) => {
  try {
    const {
      subjectId,
      title,
      description = "",
      dueDate,
      priority = "Medium",
      status = "Pending",
    } = req.body;

    if (!subjectId || !title?.trim() || !dueDate) {
      return res.status(400).json({
        message: "Subject, title, and due date are required",
      });
    }

    if (!VALID_PRIORITIES.includes(priority)) {
      return res.status(400).json({
        message: "Priority must be one of: Low, Medium, High",
      });
    }

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        message: "Status must be one of: Pending, In Progress, Completed",
      });
    }

    const assignment = await createAssignment(
      Number(subjectId),
      title.trim(),
      description.trim(),
      dueDate,
      priority,
      status
    );

    res.status(201).json(assignment);
  } catch (error) {
    console.error("Error creating assignment:", error.message);

    res.status(500).json({
      message: "Failed to create assignment",
    });
  }
};

const updateAssignmentData = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description = "",
      dueDate,
      priority = "Medium",
      status = "Pending",
    } = req.body;

    if (!title?.trim() || !dueDate) {
      return res.status(400).json({
        message: "Title and due date are required",
      });
    }

    if (!VALID_PRIORITIES.includes(priority)) {
      return res.status(400).json({
        message: "Priority must be one of: Low, Medium, High",
      });
    }

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        message: "Status must be one of: Pending, In Progress, Completed",
      });
    }

    const assignment = await updateAssignment(
      id,
      title.trim(),
      description.trim(),
      dueDate,
      priority,
      status
    );

    if (!assignment) {
      return res.status(404).json({
        message: "Assignment not found",
      });
    }

    res.json(assignment);
  } catch (error) {
    console.error("Error updating assignment:", error.message);

    res.status(500).json({
      message: "Failed to update assignment",
    });
  }
};

const changeAssignmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        message: "Status must be one of: Pending, In Progress, Completed",
      });
    }

    const assignment = await updateAssignmentStatus(id, status);

    if (!assignment) {
      return res.status(404).json({
        message: "Assignment not found",
      });
    }

    res.json(assignment);
  } catch (error) {
    console.error("Error updating assignment status:", error.message);

    res.status(500).json({
      message: "Failed to update assignment status",
    });
  }
};

const removeAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const assignment = await deleteAssignment(id);

    if (!assignment) {
      return res.status(404).json({
        message: "Assignment not found",
      });
    }

    res.json({
      message: "Assignment deleted successfully",
      assignment,
    });
  } catch (error) {
    console.error("Error deleting assignment:", error.message);

    res.status(500).json({
      message: "Failed to delete assignment",
    });
  }
};

module.exports = {
  getAssignments,
  getAssignment,
  addAssignment,
  updateAssignmentData,
  changeAssignmentStatus,
  removeAssignment,
};
