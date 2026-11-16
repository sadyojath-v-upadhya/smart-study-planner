const { getDashboardAnalytics } = require("../services/analyticsService");

const getDashboardData = async (req, res) => {
  try {
    const data = await getDashboardAnalytics();

    res.json(data);
  } catch (error) {
    console.error("Error fetching dashboard analytics:", error.message);

    res.status(500).json({
      message: "Failed to fetch dashboard analytics",
    });
  }
};

module.exports = {
  getDashboardData,
};
