const express = require("express");
const router = express.Router();
const exportController = require("../controllers/exportController");

router.get("/sessions/csv", exportController.downloadSessionsCsv);
router.get("/syllabus/csv", exportController.downloadSyllabusCsv);
router.get("/deadlines/csv", exportController.downloadDeadlinesCsv);
router.get("/report/summary", exportController.getReportData);

module.exports = router;
