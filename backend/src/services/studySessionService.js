const pool = require("../config/database");

const getAllStudySessions = async (filters = {}, userId) => {
  const conditions = ["s.user_id = $1"];
  const params = [userId];

  if (filters.date) {
    params.push(filters.date);
    conditions.push(`ss.session_date = $${params.length}`);
  }

  if (filters.status) {
    params.push(filters.status);
    conditions.push(`ss.status = $${params.length}`);
  }

  const whereClause = `WHERE ${conditions.join(" AND ")}`;

  const result = await pool.query(
    `
      SELECT
        ss.id,
        ss.topic_id,
        TO_CHAR(ss.session_date, 'YYYY-MM-DD') AS session_date,
        ss.start_time,
        ss.duration_minutes,
        ss.status,
        ss.notes,
        ss.created_at,
        t.name AS topic_name,
        t.difficulty AS topic_difficulty,
        t.completed AS topic_completed,
        s.id AS subject_id,
        s.name AS subject_name
      FROM study_sessions ss
      JOIN topics t ON ss.topic_id = t.id
      JOIN subjects s ON t.subject_id = s.id
      ${whereClause}
      ORDER BY ss.session_date ASC, ss.start_time ASC NULLS LAST, ss.id ASC
    `,
    params
  );

  return result.rows;
};

const getStudySessionById = async (id, userId) => {
  const result = await pool.query(
    `
      SELECT
        ss.id,
        ss.topic_id,
        TO_CHAR(ss.session_date, 'YYYY-MM-DD') AS session_date,
        ss.start_time,
        ss.duration_minutes,
        ss.status,
        ss.notes,
        ss.created_at,
        t.name AS topic_name,
        t.difficulty AS topic_difficulty,
        t.completed AS topic_completed,
        s.id AS subject_id,
        s.name AS subject_name
      FROM study_sessions ss
      JOIN topics t ON ss.topic_id = t.id
      JOIN subjects s ON t.subject_id = s.id
      WHERE ss.id = $1 AND s.user_id = $2
    `,
    [id, userId]
  );

  return result.rows[0];
};

const getTodayStudySessions = async (userId) => {
  const result = await pool.query(
    `
      SELECT
        ss.id,
        ss.topic_id,
        TO_CHAR(ss.session_date, 'YYYY-MM-DD') AS session_date,
        ss.start_time,
        ss.duration_minutes,
        ss.status,
        ss.notes,
        ss.created_at,
        t.name AS topic_name,
        t.difficulty AS topic_difficulty,
        t.completed AS topic_completed,
        s.id AS subject_id,
        s.name AS subject_name
      FROM study_sessions ss
      JOIN topics t ON ss.topic_id = t.id
      JOIN subjects s ON t.subject_id = s.id
      WHERE ss.session_date = CURRENT_DATE AND s.user_id = $1
      ORDER BY ss.start_time ASC NULLS LAST, ss.id ASC
    `,
    [userId]
  );

  return result.rows;
};

const createStudySession = async (
  topicId,
  sessionDate,
  startTime,
  durationMinutes,
  notes = "",
  status = "Planned",
  userId
) => {
  // Verify topic belongs to user
  const topicCheck = await pool.query(
    `
      SELECT t.id
      FROM topics t
      JOIN subjects s ON t.subject_id = s.id
      WHERE t.id = $1 AND s.user_id = $2
    `,
    [topicId, userId]
  );

  if (topicCheck.rows.length === 0) {
    return null;
  }

  const result = await pool.query(
    `
      INSERT INTO study_sessions (
        topic_id,
        session_date,
        start_time,
        duration_minutes,
        notes,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `,
    [topicId, sessionDate, startTime || null, durationMinutes, notes, status]
  );

  return getStudySessionById(result.rows[0].id, userId);
};

const updateStudySession = async (
  id,
  sessionDate,
  startTime,
  durationMinutes,
  notes,
  status,
  userId
) => {
  const existing = await getStudySessionById(id, userId);
  if (!existing) return null;

  await pool.query(
    `
      UPDATE study_sessions
      SET
        session_date = $1,
        start_time = $2,
        duration_minutes = $3,
        notes = $4,
        status = $5,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
    `,
    [sessionDate, startTime || null, durationMinutes, notes, status, id]
  );

  return getStudySessionById(id, userId);
};

const updateStudySessionStatus = async (id, status, userId) => {
  const existing = await getStudySessionById(id, userId);
  if (!existing) return null;

  await pool.query(
    `
      UPDATE study_sessions
      SET
        status = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `,
    [status, id]
  );

  return getStudySessionById(id, userId);
};

const deleteStudySession = async (id, userId) => {
  const existing = await getStudySessionById(id, userId);
  if (!existing) return null;

  const result = await pool.query(
    "DELETE FROM study_sessions WHERE id = $1 RETURNING *",
    [id]
  );

  return result.rows[0];
};

module.exports = {
  getAllStudySessions,
  getStudySessionById,
  getTodayStudySessions,
  createStudySession,
  updateStudySession,
  updateStudySessionStatus,
  deleteStudySession,
};
