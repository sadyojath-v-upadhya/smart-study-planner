const express = require("express");

const {
  getTopics,
  getSubjectTopics,
  getTopic,
  addTopic,
  updateTopicData,
  removeTopic,
} = require("../controllers/topicController");

const router = express.Router();

router.get("/", getTopics);
router.get("/subject/:subjectId", getSubjectTopics);
router.get("/:id", getTopic);
router.post("/", addTopic);
router.put("/:id", updateTopicData);
router.delete("/:id", removeTopic);

module.exports = router;