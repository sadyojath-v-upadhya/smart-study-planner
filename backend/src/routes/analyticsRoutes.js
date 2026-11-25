const express = require("express");
const {
  getDashboardData,
  getStreakData,
} = require("../controllers/analyticsController");

const router = express.Router();

router.get("/dashboard", getDashboardData);
router.get("/streak", getStreakData);

module.exports = router;
