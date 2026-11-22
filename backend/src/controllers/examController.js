const {
  getAllExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
} = require("../services/examService");

const getExams = async (req, res) => {
  try {
    const { subjectId } = req.query;
    const exams = await getAllExams(
      {
        subjectId: subjectId ? Number(subjectId) : undefined,
      },
      req.user.userId
    );

    res.json(exams);
  } catch (error) {
    console.error("Error fetching exams:", error.message);
    res.status(500).json({
      message: "Failed to fetch exams",
    });
  }
};

const getExam = async (req, res) => {
  try {
    const { id } = req.params;
    const exam = await getExamById(id, req.user.userId);

    if (!exam) {
      return res.status(404).json({
        message: "Exam not found",
      });
    }

    res.json(exam);
  } catch (error) {
    console.error("Error fetching exam:", error.message);
    res.status(500).json({
      message: "Failed to fetch exam",
    });
  }
};

const addExam = async (req, res) => {
  try {
    const {
      subjectId,
      title,
      examDate,
      startTime = null,
      durationMinutes = null,
      notes = "",
    } = req.body;

    if (!subjectId || !title?.trim() || !examDate) {
      return res.status(400).json({
        message: "Subject, title, and exam date are required",
      });
    }

    const exam = await createExam(
      Number(subjectId),
      title.trim(),
      examDate,
      startTime || null,
      durationMinutes ? Number(durationMinutes) : null,
      notes.trim(),
      req.user.userId
    );

    if (!exam) {
      return res.status(404).json({
        message: "Subject not found or access denied",
      });
    }

    res.status(201).json(exam);
  } catch (error) {
    console.error("Error creating exam:", error.message);
    res.status(500).json({
      message: "Failed to create exam",
    });
  }
};

const updateExamData = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      examDate,
      startTime = null,
      durationMinutes = null,
      notes = "",
    } = req.body;

    if (!title?.trim() || !examDate) {
      return res.status(400).json({
        message: "Title and exam date are required",
      });
    }

    const exam = await updateExam(
      id,
      title.trim(),
      examDate,
      startTime || null,
      durationMinutes ? Number(durationMinutes) : null,
      notes.trim(),
      req.user.userId
    );

    if (!exam) {
      return res.status(404).json({
        message: "Exam not found",
      });
    }

    res.json(exam);
  } catch (error) {
    console.error("Error updating exam:", error.message);
    res.status(500).json({
      message: "Failed to update exam",
    });
  }
};

const removeExam = async (req, res) => {
  try {
    const { id } = req.params;
    const exam = await deleteExam(id, req.user.userId);

    if (!exam) {
      return res.status(404).json({
        message: "Exam not found",
      });
    }

    res.json({
      message: "Exam deleted successfully",
      exam,
    });
  } catch (error) {
    console.error("Error deleting exam:", error.message);
    res.status(500).json({
      message: "Failed to delete exam",
    });
  }
};

module.exports = {
  getExams,
  getExam,
  addExam,
  updateExamData,
  removeExam,
};
