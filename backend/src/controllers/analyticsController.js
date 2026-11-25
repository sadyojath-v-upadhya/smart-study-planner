const {
  getDashboardAnalytics,
  getStreakAndHeatmap,
} = require("../services/analyticsService");

const getDashboardData = async (req, res) => {
  try {
    const data = await getDashboardAnalytics(req.user.userId);
    res.json(data);
  } catch (error) {
    console.error("Error fetching dashboard analytics:", error.message);
    res.status(500).json({
      message: "Failed to fetch dashboard analytics",
    });
  }
};

const getStreakData = async (req, res) => {
  try {
    const data = await getStreakAndHeatmap(req.user.userId);
    res.json(data);
  } catch (error) {
    console.error("Error fetching streak and heatmap data:", error.message);
    res.status(500).json({
      message: "Failed to fetch study streak data",
    });
  }
};

module.exports = {
  getDashboardData,
  getStreakData,
};
