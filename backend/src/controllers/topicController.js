const {
  getAllTopics,
  getTopicsBySubject,
  getTopicById,
  createTopic,
  updateTopic,
  deleteTopic,
} = require("../services/topicService");

const VALID_DIFFICULTIES = ["Easy", "Medium", "Hard"];

const getTopics = async (req, res) => {
  try {
    const topics = await getAllTopics(req.user.userId);
    res.json(topics);
  } catch (error) {
    console.error("Error fetching topics:", error.message);
    res.status(500).json({
      message: "Failed to fetch topics",
    });
  }
};

const getSubjectTopics = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const topics = await getTopicsBySubject(subjectId, req.user.userId);
    res.json(topics);
  } catch (error) {
    console.error("Error fetching subject topics:", error.message);
    res.status(500).json({
      message: "Failed to fetch subject topics",
    });
  }
};

const getTopic = async (req, res) => {
  try {
    const { id } = req.params;
    const topic = await getTopicById(id, req.user.userId);

    if (!topic) {
      return res.status(404).json({
        message: "Topic not found",
      });
    }

    res.json(topic);
  } catch (error) {
    console.error("Error fetching topic:", error.message);
    res.status(500).json({
      message: "Failed to fetch topic",
    });
  }
};

const addTopic = async (req, res) => {
  try {
    const { subjectId, name, description, difficulty = "Medium" } = req.body;

    if (!subjectId || !name?.trim() || !description?.trim()) {
      return res.status(400).json({
        message: "Subject, name, and description are required",
      });
    }

    if (!VALID_DIFFICULTIES.includes(difficulty)) {
      return res.status(400).json({
        message: "Difficulty must be one of: Easy, Medium, Hard",
      });
    }

    const topic = await createTopic(
      subjectId,
      name.trim(),
      description.trim(),
      difficulty,
      req.user.userId
    );

    if (!topic) {
      return res.status(404).json({
        message: "Subject not found or access denied",
      });
    }

    res.status(201).json(topic);
  } catch (error) {
    console.error("Error creating topic:", error.message);
    res.status(500).json({
      message: "Failed to create topic",
    });
  }
};

const updateTopicData = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, completed, difficulty = "Medium" } = req.body;

    if (
      !name?.trim() ||
      !description?.trim() ||
      typeof completed !== "boolean"
    ) {
      return res.status(400).json({
        message: "Name, description, and completed status are required",
      });
    }

    if (!VALID_DIFFICULTIES.includes(difficulty)) {
      return res.status(400).json({
        message: "Difficulty must be one of: Easy, Medium, Hard",
      });
    }

    const topic = await updateTopic(
      id,
      name.trim(),
      description.trim(),
      completed,
      difficulty,
      req.user.userId
    );

    if (!topic) {
      return res.status(404).json({
        message: "Topic not found",
      });
    }

    res.json(topic);
  } catch (error) {
    console.error("Error updating topic:", error.message);
    res.status(500).json({
      message: "Failed to update topic",
    });
  }
};

const removeTopic = async (req, res) => {
  try {
    const { id } = req.params;
    const topic = await deleteTopic(id, req.user.userId);

    if (!topic) {
      return res.status(404).json({
        message: "Topic not found",
      });
    }

    res.json({
      message: "Topic deleted successfully",
      topic,
    });
  } catch (error) {
    console.error("Error deleting topic:", error.message);
    res.status(500).json({
      message: "Failed to delete topic",
    });
  }
};

module.exports = {
  getTopics,
  getSubjectTopics,
  getTopic,
  addTopic,
  updateTopicData,
  removeTopic,
};
