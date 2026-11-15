const pool = require("../config/database");

const getAllTopics = async () => {
  const result = await pool.query(
    `
      SELECT *
      FROM topics
      ORDER BY id ASC
    `
  );

  return result.rows;
};

const getTopicsBySubject = async (subjectId) => {
  const result = await pool.query(
    `
      SELECT *
      FROM topics
      WHERE subject_id = $1
      ORDER BY id ASC
    `,
    [subjectId]
  );

  return result.rows;
};

const createTopic = async (subjectId, name, description) => {
  const result = await pool.query(
    `
      INSERT INTO topics (subject_id, name, description)
      VALUES ($1, $2, $3)
      RETURNING *
    `,
    [subjectId, name, description]
  );

  return result.rows[0];
};

const getTopicById = async (id) => {
  const result = await pool.query(
    `
      SELECT *
      FROM topics
      WHERE id = $1
    `,
    [id]
  );

  return result.rows[0];
};

const updateTopic = async (
  id,
  name,
  description,
  completed
) => {
  const result = await pool.query(
    `
      UPDATE topics
      SET
        name = $1,
        description = $2,
        completed = $3,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `,
    [name, description, completed, id]
  );

  return result.rows[0];
};

const deleteTopic = async (id) => {
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