const pool = require("../config/database");

const getAllSubjects = async () => {
  const result = await pool.query(`
    SELECT
      s.id,
      s.name,
      s.description,
      COUNT(t.id) AS topic_count,
      COUNT(t.id) FILTER (WHERE t.completed = true) AS completed_topics,
      CASE
        WHEN COUNT(t.id) = 0 THEN 0
        ELSE ROUND(
          COUNT(t.id) FILTER (WHERE t.completed = true) * 100.0
          / COUNT(t.id)
        )
      END AS progress
    FROM subjects s
    LEFT JOIN topics t
      ON s.id = t.subject_id
    GROUP BY s.id, s.name, s.description
    ORDER BY s.id ASC
  `);

  return result.rows;
};

const getSubjectById = async (id) => {
  const result = await pool.query(
    "SELECT * FROM subjects WHERE id = $1",
    [id]
  );

  return result.rows[0];
};

const createSubject = async (name, description, progress = 0) => {
  const result = await pool.query(
    `
      INSERT INTO subjects (name, description, progress)
      VALUES ($1, $2, $3)
      RETURNING *
    `,
    [name, description, progress]
  );

  return result.rows[0];
};

const updateSubject = async (id, name, description) => {
  const result = await pool.query(
    `
      UPDATE subjects
      SET
        name = $1,
        description = $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `,
    [name, description, id]
  );

  return result.rows[0];
};

const deleteSubject = async (id) => {
  const result = await pool.query(
    "DELETE FROM subjects WHERE id = $1 RETURNING *",
    [id]
  );

  return result.rows[0];
};

module.exports = {
  getAllSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
};