const pool = require("../config/database");

const getAllExams = async (filters = {}) => {
  const conditions = [];
  const params = [];

  if (filters.subjectId) {
    params.push(filters.subjectId);
    conditions.push(`e.subject_id = $${params.length}`);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const result = await pool.query(
    `
      SELECT
        e.id,
        e.subject_id,
        e.title,
        TO_CHAR(e.exam_date, 'YYYY-MM-DD') AS exam_date,
        e.start_time,
        e.duration_minutes,
        e.notes,
        e.created_at,
        s.name AS subject_name,
        (e.exam_date - CURRENT_DATE) AS days_left
      FROM exams e
      JOIN subjects s ON e.subject_id = s.id
      ${whereClause}
      ORDER BY e.exam_date ASC, e.start_time ASC NULLS LAST, e.id ASC
    `,
    params
  );

  return result.rows;
};

const getExamById = async (id) => {
  const result = await pool.query(
    `
      SELECT
        e.id,
        e.subject_id,
        e.title,
        TO_CHAR(e.exam_date, 'YYYY-MM-DD') AS exam_date,
        e.start_time,
        e.duration_minutes,
        e.notes,
        e.created_at,
        s.name AS subject_name,
        (e.exam_date - CURRENT_DATE) AS days_left
      FROM exams e
      JOIN subjects s ON e.subject_id = s.id
      WHERE e.id = $1
    `,
    [id]
  );

  return result.rows[0];
};

const createExam = async (
  subjectId,
  title,
  examDate,
  startTime = null,
  durationMinutes = null,
  notes = ""
) => {
  const result = await pool.query(
    `
      INSERT INTO exams (
        subject_id,
        title,
        exam_date,
        start_time,
        duration_minutes,
        notes
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `,
    [
      subjectId,
      title,
      examDate,
      startTime || null,
      durationMinutes || null,
      notes,
    ]
  );

  return getExamById(result.rows[0].id);
};

const updateExam = async (
  id,
  title,
  examDate,
  startTime,
  durationMinutes,
  notes
) => {
  const result = await pool.query(
    `
      UPDATE exams
      SET
        title = $1,
        exam_date = $2,
        start_time = $3,
        duration_minutes = $4,
        notes = $5,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `,
    [
      title,
      examDate,
      startTime || null,
      durationMinutes || null,
      notes,
      id,
    ]
  );

  if (!result.rows[0]) return null;
  return getExamById(id);
};

const deleteExam = async (id) => {
  const result = await pool.query(
    "DELETE FROM exams WHERE id = $1 RETURNING *",
    [id]
  );

  return result.rows[0];
};

module.exports = {
  getAllExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
};
