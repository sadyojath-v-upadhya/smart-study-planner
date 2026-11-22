const pool = require("../config/database");

const getAllExams = async (filters = {}, userId) => {
  const conditions = ["s.user_id = $1"];
  const params = [userId];

  if (filters.subjectId) {
    params.push(filters.subjectId);
    conditions.push(`e.subject_id = $${params.length}`);
  }

  const whereClause = `WHERE ${conditions.join(" AND ")}`;

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

const getExamById = async (id, userId) => {
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
      WHERE e.id = $1 AND s.user_id = $2
    `,
    [id, userId]
  );

  return result.rows[0];
};

const createExam = async (
  subjectId,
  title,
  examDate,
  startTime = null,
  durationMinutes = null,
  notes = "",
  userId
) => {
  // Verify subject belongs to user
  const subjectCheck = await pool.query(
    "SELECT id FROM subjects WHERE id = $1 AND user_id = $2",
    [subjectId, userId]
  );

  if (subjectCheck.rows.length === 0) {
    return null;
  }

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

  return getExamById(result.rows[0].id, userId);
};

const updateExam = async (
  id,
  title,
  examDate,
  startTime,
  durationMinutes,
  notes,
  userId
) => {
  const existing = await getExamById(id, userId);
  if (!existing) return null;

  await pool.query(
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

  return getExamById(id, userId);
};

const deleteExam = async (id, userId) => {
  const existing = await getExamById(id, userId);
  if (!existing) return null;

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
