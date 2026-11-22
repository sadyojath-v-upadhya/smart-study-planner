const pool = require("../config/database");

const getAllTopics = async (userId) => {
  const result = await pool.query(
    `
      SELECT t.*
      FROM topics t
      JOIN subjects s ON t.subject_id = s.id
      WHERE s.user_id = $1
      ORDER BY t.id ASC
    `,
    [userId]
  );

  return result.rows;
};

const getTopicsBySubject = async (subjectId, userId) => {
  const result = await pool.query(
    `
      SELECT t.*
      FROM topics t
      JOIN subjects s ON t.subject_id = s.id
      WHERE t.subject_id = $1 AND s.user_id = $2
      ORDER BY t.id ASC
    `,
    [subjectId, userId]
  );

  return result.rows;
};

const getTopicById = async (id, userId) => {
  const result = await pool.query(
    `
      SELECT t.*
      FROM topics t
      JOIN subjects s ON t.subject_id = s.id
      WHERE t.id = $1 AND s.user_id = $2
    `,
    [id, userId]
  );

  return result.rows[0];
};

const createTopic = async (
  subjectId,
  name,
  description,
  difficulty = "Medium",
  userId
) => {
  // Verify subject ownership
  const subjectCheck = await pool.query(
    "SELECT id FROM subjects WHERE id = $1 AND user_id = $2",
    [subjectId, userId]
  );

  if (subjectCheck.rows.length === 0) {
    return null;
  }

  const result = await pool.query(
    `
      INSERT INTO topics (subject_id, name, description, difficulty)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `,
    [subjectId, name, description, difficulty]
  );

  return result.rows[0];
};

const updateTopic = async (
  id,
  name,
  description,
  completed,
  difficulty = "Medium",
  userId
) => {
  // Check ownership
  const existing = await getTopicById(id, userId);
  if (!existing) {
    return null;
  }

  const result = await pool.query(
    `
      UPDATE topics
      SET
        name = $1,
        description = $2,
        completed = $3,
        difficulty = $4,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
    `,
    [name, description, completed, difficulty, id]
  );

  return result.rows[0];
};

const deleteTopic = async (id, userId) => {
  // Check ownership
  const existing = await getTopicById(id, userId);
  if (!existing) {
    return null;
  }

  const result = await pool.query(
    `
      DELETE FROM topics
      WHERE id = $1
      RETURNING *
    `,
    [id]
  );

  return result.rows[0];
};

module.exports = {
  getAllTopics,
  getTopicsBySubject,
  getTopicById,
  createTopic,
  updateTopic,
  deleteTopic,
};
