const {
  getAllSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
} = require("../services/subjectService");

const getSubjects = async (req, res) => {
  try {
    const subjects = await getAllSubjects();

    res.json(subjects);
  } catch (error) {
    console.error("Error fetching subjects:", error.message);

    res.status(500).json({
      message: "Failed to fetch subjects",
    });
  }
};

const getSubject = async (req, res) => {
  try {
    const { id } = req.params;

    const subject = await getSubjectById(id);

    if (!subject) {
      return res.status(404).json({
        message: "Subject not found",
      });
    }

    res.json(subject);
  } catch (error) {
    console.error("Error fetching subject:", error.message);

    res.status(500).json({
      message: "Failed to fetch subject",
    });
  }
};

const addSubject = async (req, res) => {
  try {
    const { name, description, progress = 0 } = req.body;

    if (
      typeof name !== "string" ||
      typeof description !== "string" ||
      !name.trim() ||
      !description.trim()
    ) {
      return res.status(400).json({
        message: "Valid name and description are required",
      });
    }

    if (
      !Number.isInteger(progress) ||
      progress < 0 ||
      progress > 100
    ) {
      return res.status(400).json({
        message: "Progress must be an integer between 0 and 100",
      });
    }

    const subject = await createSubject(
      name.trim(),
      description.trim(),
      progress
    );

    res.status(201).json(subject);
  } catch (error) {
    console.error("Error creating subject:", error.message);

    res.status(500).json({
      message: "Failed to create subject",
    });
  }
};

const updateSubjectData = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (
      typeof name !== "string" ||
      typeof description !== "string" ||
      !name.trim() ||
      !description.trim()
    ) {
      return res.status(400).json({
        message: "Valid name and description are required",
      });
    }

    const subject = await updateSubject(
      id,
      name.trim(),
      description.trim()
    );

    if (!subject) {
      return res.status(404).json({
        message: "Subject not found",
      });
    }

    res.json(subject);
  } catch (error) {
    console.error("Error updating subject:", error.message);

    res.status(500).json({
      message: "Failed to update subject",
    });
  }
};

const removeSubject = async (req, res) => {
  try {
    const { id } = req.params;

    const subject = await deleteSubject(id);

    if (!subject) {
      return res.status(404).json({
        message: "Subject not found",
      });
    }

    res.json({
      message: "Subject deleted successfully",
      subject,
    });
  } catch (error) {
    console.error("Error deleting subject:", error.message);

    res.status(500).json({
      message: "Failed to delete subject",
    });
  }
};

module.exports = {
  getSubjects,
  getSubject,
  addSubject,
  updateSubjectData,
  removeSubject,
};