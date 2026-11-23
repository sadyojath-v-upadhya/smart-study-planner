const exportService = require("../services/exportService");

const downloadSessionsCsv = async (req, res) => {
  try {
    const csv = await exportService.exportStudySessionsCsv(req.user.userId);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="study_sessions_log.csv"'
    );
    res.status(200).send(csv);
  } catch (error) {
    console.error("Error exporting sessions CSV:", error);
    res.status(500).json({ message: "Failed to export study sessions CSV" });
  }
};

const downloadSyllabusCsv = async (req, res) => {
  try {
    const csv = await exportService.exportSyllabusCsv(req.user.userId);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="syllabus_progress.csv"'
    );
    res.status(200).send(csv);
  } catch (error) {
    console.error("Error exporting syllabus CSV:", error);
    res.status(500).json({ message: "Failed to export syllabus CSV" });
  }
};

const downloadDeadlinesCsv = async (req, res) => {
  try {
    const csv = await exportService.exportDeadlinesCsv(req.user.userId);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="deadlines_exams.csv"'
    );
    res.status(200).send(csv);
  } catch (error) {
    console.error("Error exporting deadlines CSV:", error);
    res.status(500).json({ message: "Failed to export deadlines CSV" });
  }
};

const getReportData = async (req, res) => {
  try {
    const data = await exportService.getAcademicReportData(req.user.userId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error fetching academic report data:", error);
    res.status(500).json({ message: "Failed to fetch academic report data" });
  }
};

module.exports = {
  downloadSessionsCsv,
  downloadSyllabusCsv,
  downloadDeadlinesCsv,
  getReportData,
};
