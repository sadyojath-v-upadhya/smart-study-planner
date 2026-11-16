const { getUpcomingDeadlines } = require("../services/deadlineService");

const getDeadlines = async (req, res) => {
  try {
    const deadlines = await getUpcomingDeadlines();

    res.json(deadlines);
  } catch (error) {
    console.error("Error fetching upcoming deadlines:", error.message);

    res.status(500).json({
      message: "Failed to fetch upcoming deadlines",
    });
  }
};

module.exports = {
  getDeadlines,
};
