const pool = require("../config/database");

const getUpcomingDeadlines = async (userId) => {
  const result = await pool.query(
    `
      SELECT
        'assignment' AS type,
        a.id,
        a.title,
        TO_CHAR(a.due_date, 'YYYY-MM-DD') AS deadline_date,
        a.priority,
        a.status,
        s.id AS subject_id,
        s.name AS subject_name,
        (a.due_date - CURRENT_DATE) AS days_left
      FROM assignments a
      JOIN subjects s ON a.subject_id = s.id
      WHERE a.status != 'Completed' AND a.due_date >= CURRENT_DATE AND s.user_id = $1

      UNION ALL

      SELECT
        'exam' AS type,
        e.id,
        e.title,
        TO_CHAR(e.exam_date, 'YYYY-MM-DD') AS deadline_date,
        'High' AS priority,
        'Upcoming' AS status,
        s.id AS subject_id,
        s.name AS subject_name,
        (e.exam_date - CURRENT_DATE) AS days_left
      FROM exams e
      JOIN subjects s ON e.subject_id = s.id
      WHERE e.exam_date >= CURRENT_DATE AND s.user_id = $1

      ORDER BY deadline_date ASC, days_left ASC
      LIMIT 10
    `,
    [userId]
  );

  return result.rows;
};

module.exports = {
  getUpcomingDeadlines,
};
