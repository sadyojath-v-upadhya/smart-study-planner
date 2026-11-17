const {
  getStudyRecommendations,
} = require("../services/recommendationService");

const getRecommendations = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 4;
    const recommendations = await getStudyRecommendations(limit);

    res.json(recommendations);
  } catch (error) {
    console.error("Error fetching study recommendations:", error.message);

    res.status(500).json({
      message: "Failed to fetch study recommendations",
    });
  }
};

module.exports = {
  getRecommendations,
};
