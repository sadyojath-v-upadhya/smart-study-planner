const pool = require("../config/database");

/**
 * Escapes a cell value according to RFC 4180 CSV specifications.
 * Encloses the field in quotes and escapes internal quotes as '""'.
 */
function escapeCsvCell(val) {
  if (val === null || val === undefined) return '""';
  const str = String(val).trim();
  return `"${str.replace(/"/g, '""')}"`;
}

/**
 * Converts an array of column headers and row objects into a CSV string.
 */
function rowsToCsv(headers, rows, mapRowFn) {
  const headerLine = headers.map(escapeCsvCell).join(",");
  const dataLines = rows.map((row) =>
    mapRowFn(row).map(escapeCsvCell).join(",")
  );
  return [headerLine, ...dataLines].join("\r\n");
}

/**
 * Export Study Sessions Log as CSV
 */
const exportStudySessionsCsv = async (userId) => {
  const result = await pool.query(
    `
      SELECT
        TO_CHAR(ss.session_date, 'YYYY-MM-DD') AS session_date,
        ss.start_time,
        s.name AS subject_name,
        t.name AS topic_name,
        t.difficulty AS topic_difficulty,
        ss.duration_minutes,
        ss.status,
        COALESCE(ss.notes, '') AS notes
      FROM study_sessions ss
      JOIN topics t ON ss.topic_id = t.id
      JOIN subjects s ON t.subject_id = s.id
      WHERE s.user_id = $1
      ORDER BY ss.session_date DESC, ss.id DESC
    `,
    [userId]
  );

  const headers = [
    "Date",
    "Start Time",
    "Subject",
    "Topic",
    "Difficulty",
    "Duration (Minutes)",
    "Status",
    "Notes",
  ];

  return rowsToCsv(headers, result.rows, (row) => [
    row.session_date,
    row.start_time || "N/A",
    row.subject_name,
    row.topic_name,
    row.topic_difficulty,
    row.duration_minutes,
    row.status,
    row.notes,
  ]);
};

/**
 * Export Syllabus & Topics Progress as CSV
 */
const exportSyllabusCsv = async (userId) => {
  const result = await pool.query(
    `
      SELECT
        s.name AS subject_name,
        t.name AS topic_name,
        t.difficulty,
        CASE WHEN t.completed = true THEN 'Completed' ELSE 'Pending' END AS status,
        COALESCE(t.description, '') AS description
      FROM topics t
      JOIN subjects s ON t.subject_id = s.id
      WHERE s.user_id = $1
      ORDER BY s.name ASC, t.id ASC
    `,
    [userId]
  );

  const headers = [
    "Subject",
    "Topic Name",
    "Difficulty",
    "Completion Status",
    "Description",
  ];

  return rowsToCsv(headers, result.rows, (row) => [
    row.subject_name,
    row.topic_name,
    row.difficulty,
    row.status,
    row.description,
  ]);
};

/**
 * Export Deadlines, Assignments, and Exams as CSV
 */
const exportDeadlinesCsv = async (userId) => {
  const result = await pool.query(
    `
      SELECT
        'Assignment' AS type,
        a.title,
        s.name AS subject_name,
        TO_CHAR(a.due_date, 'YYYY-MM-DD') AS due_date,
        a.priority,
        a.status,
        COALESCE(a.description, '') AS details
      FROM assignments a
      JOIN subjects s ON a.subject_id = s.id
      WHERE s.user_id = $1

      UNION ALL

      SELECT
        'Exam' AS type,
        e.title,
        s.name AS subject_name,
        TO_CHAR(e.exam_date, 'YYYY-MM-DD') AS due_date,
        'High' AS priority,
        'Scheduled' AS status,
        COALESCE(e.notes, '') AS details
      FROM exams e
      JOIN subjects s ON e.subject_id = s.id
      WHERE s.user_id = $1

      ORDER BY due_date ASC
    `,
    [userId]
  );

  const headers = [
    "Type",
    "Title",
    "Subject",
    "Scheduled Date",
    "Priority",
    "Status",
    "Details",
  ];

  return rowsToCsv(headers, result.rows, (row) => [
    row.type,
    row.title,
    row.subject_name,
    row.due_date,
    row.priority,
    row.status,
    row.details,
  ]);
};

/**
 * Comprehensive Academic Summary Report (Used for PDF Report Generation)
 */
const getAcademicReportData = async (userId) => {
  // 1. User Info
  const userResult = await pool.query(
    "SELECT id, name, email, created_at FROM users WHERE id = $1",
    [userId]
  );
  const user = userResult.rows[0] || {};

  // 2. Overview Metrics
  const topicStats = await pool.query(
    `
      SELECT
        COUNT(t.id) AS total_topics,
        COUNT(t.id) FILTER (WHERE t.completed = true) AS completed_topics,
        CASE
          WHEN COUNT(t.id) = 0 THEN 0
          ELSE ROUND(COUNT(t.id) FILTER (WHERE t.completed = true) * 100.0 / COUNT(t.id))
        END AS overall_progress
      FROM topics t
      JOIN subjects s ON t.subject_id = s.id
      WHERE s.user_id = $1
    `,
    [userId]
  );

  const sessionStats = await pool.query(
    `
      SELECT
        COALESCE(SUM(ss.duration_minutes) FILTER (WHERE ss.status = 'Completed'), 0) AS total_minutes,
        ROUND(COALESCE(SUM(ss.duration_minutes) FILTER (WHERE ss.status = 'Completed'), 0) / 60.0, 1) AS total_hours,
        COUNT(ss.id) FILTER (WHERE ss.status = 'Completed') AS completed_sessions
      FROM study_sessions ss
      JOIN topics t ON ss.topic_id = t.id
      JOIN subjects s ON t.subject_id = s.id
      WHERE s.user_id = $1
    `,
    [userId]
  );

  // 3. Subject-wise Details
  const subjectsResult = await pool.query(
    `
      SELECT
        s.id,
        s.name,
        s.description,
        COUNT(t.id) AS topic_count,
        COUNT(t.id) FILTER (WHERE t.completed = true) AS completed_topics,
        CASE
          WHEN COUNT(t.id) = 0 THEN 0
          ELSE ROUND(COUNT(t.id) FILTER (WHERE t.completed = true) * 100.0 / COUNT(t.id))
        END AS progress
      FROM subjects s
      LEFT JOIN topics t ON s.id = t.subject_id
      WHERE s.user_id = $1
      GROUP BY s.id, s.name, s.description
      ORDER BY s.id ASC
    `,
    [userId]
  );

  // 4. Upcoming Deadlines
  const deadlinesResult = await pool.query(
    `
      SELECT
        'Assignment' AS type,
        a.title,
        s.name AS subject_name,
        TO_CHAR(a.due_date, 'YYYY-MM-DD') AS deadline_date,
        a.priority,
        a.status
      FROM assignments a
      JOIN subjects s ON a.subject_id = s.id
      WHERE a.status != 'Completed' AND a.due_date >= CURRENT_DATE AND s.user_id = $1

      UNION ALL

      SELECT
        'Exam' AS type,
        e.title,
        s.name AS subject_name,
        TO_CHAR(e.exam_date, 'YYYY-MM-DD') AS deadline_date,
        'High' AS priority,
        'Upcoming' AS status
      FROM exams e
      JOIN subjects s ON e.subject_id = s.id
      WHERE e.exam_date >= CURRENT_DATE AND s.user_id = $1

      ORDER BY deadline_date ASC
      LIMIT 10
    `,
    [userId]
  );

  // 5. Recent Study Sessions
  const recentSessionsResult = await pool.query(
    `
      SELECT
        ss.id,
        TO_CHAR(ss.session_date, 'YYYY-MM-DD') AS session_date,
        ss.start_time,
        ss.duration_minutes,
        ss.status,
        t.name AS topic_name,
        s.name AS subject_name
      FROM study_sessions ss
      JOIN topics t ON ss.topic_id = t.id
      JOIN subjects s ON t.subject_id = s.id
      WHERE s.user_id = $1
      ORDER BY ss.session_date DESC, ss.id DESC
      LIMIT 15
    `,
    [userId]
  );

  const tStats = topicStats.rows[0] || {};
  const sStats = sessionStats.rows[0] || {};

  return {
    student: {
      name: user.name || "Student",
      email: user.email || "",
      joinedAt: user.created_at,
    },
    generatedAt: new Date().toISOString(),
    overview: {
      totalSubjects: subjectsResult.rows.length,
      totalTopics: Number(tStats.total_topics) || 0,
      completedTopics: Number(tStats.completed_topics) || 0,
      overallProgress: Number(tStats.overall_progress) || 0,
      totalStudyHours: Number(sStats.total_hours) || 0,
      completedSessions: Number(sStats.completed_sessions) || 0,
    },
    subjects: subjectsResult.rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      topicCount: Number(row.topic_count),
      completedTopics: Number(row.completed_topics),
      progress: Number(row.progress),
    })),
    upcomingDeadlines: deadlinesResult.rows,
    recentSessions: recentSessionsResult.rows,
  };
};

module.exports = {
  exportStudySessionsCsv,
  exportSyllabusCsv,
  exportDeadlinesCsv,
  getAcademicReportData,
};
