const pool = require("../config/database");

const getAllSubjects = async () => {
  const result = await pool.query(
    "SELECT * FROM subjects ORDER BY id ASC"
  );

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

const updateSubject = async (id, name, description, progress) => {
  const result = await pool.query(
    `
      UPDATE subjects
      SET
        name = $1,
        description = $2,
        progress = $3,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `,
    [name, description, progress, id]
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