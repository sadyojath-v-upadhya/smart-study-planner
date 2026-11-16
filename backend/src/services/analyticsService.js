const pool = require("../config/database");

const getDashboardAnalytics = async () => {
  // 1. Overall Topic Stats
  const topicStatsResult = await pool.query(`
    SELECT
      COUNT(t.id) AS total_topics,
      COUNT(t.id) FILTER (WHERE t.completed = true) AS completed_topics,
      COUNT(t.id) FILTER (WHERE t.completed = false) AS pending_topics,
      CASE
        WHEN COUNT(t.id) = 0 THEN 0
        ELSE ROUND(COUNT(t.id) FILTER (WHERE t.completed = true) * 100.0 / COUNT(t.id))
      END AS overall_progress
    FROM topics t;
  `);

  // 2. Study Time Stats (from study_sessions)
  const sessionStatsResult = await pool.query(`
    SELECT
      COALESCE(SUM(duration_minutes) FILTER (WHERE status = 'Completed'), 0) AS total_study_minutes,
      ROUND(COALESCE(SUM(duration_minutes) FILTER (WHERE status = 'Completed'), 0) / 60.0, 1) AS total_study_hours,
      COUNT(id) AS total_sessions,
      COUNT(id) FILTER (WHERE status = 'Completed') AS completed_sessions
    FROM study_sessions;
  `);

  // 3. Pending Assignments and Upcoming Exams Counts
  const countsResult = await pool.query(`
    SELECT
      (SELECT COUNT(id) FROM assignments WHERE status != 'Completed') AS pending_assignments,
      (SELECT COUNT(id) FROM exams WHERE exam_date >= CURRENT_DATE) AS upcoming_exams;
  `);

  // 4. Subject-wise Progress Breakdown
  const subjectProgressResult = await pool.query(`
    SELECT
      s.id,
      s.name,
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
    LEFT JOIN topics t ON s.id = t.subject_id
    GROUP BY s.id, s.name
    ORDER BY s.id ASC;
  `);

  // 5. 7-Day Study Trend (Daily study hours for the last 7 days)
  const studyTrendResult = await pool.query(`
    SELECT
      TO_CHAR(d.day, 'Dy') AS day,
      TO_CHAR(d.day, 'YYYY-MM-DD') AS full_date,
      COALESCE(ROUND(SUM(ss.duration_minutes) / 60.0, 1), 0)::float AS hours
    FROM generate_series(
      CURRENT_DATE - INTERVAL '6 days',
      CURRENT_DATE,
      '1 day'::interval
    ) AS d(day)
    LEFT JOIN study_sessions ss
      ON ss.session_date = d.day::date AND ss.status = 'Completed'
    GROUP BY d.day
    ORDER BY d.day ASC;
  `);

  // 6. Today's Combined Tasks (Today's Study Sessions + Assignments due today)
  const todayTasksResult = await pool.query(`
    SELECT
      'session' AS type,
      ss.id,
      t.name AS title,
      s.name AS subject_name,
      ss.status,
      ss.duration_minutes,
      (ss.status = 'Completed') AS completed
    FROM study_sessions ss
    JOIN topics t ON ss.topic_id = t.id
    JOIN subjects s ON t.subject_id = s.id
    WHERE ss.session_date = CURRENT_DATE

    UNION ALL

    SELECT
      'assignment' AS type,
      a.id,
      a.title,
      s.name AS subject_name,
      a.status,
      NULL AS duration_minutes,
      (a.status = 'Completed') AS completed
    FROM assignments a
    JOIN subjects s ON a.subject_id = s.id
    WHERE a.due_date = CURRENT_DATE

    ORDER BY completed ASC, id ASC;
  `);

  const topicStats = topicStatsResult.rows[0];
  const sessionStats = sessionStatsResult.rows[0];
  const counts = countsResult.rows[0];

  return {
    overview: {
      overallProgress: Number(topicStats.overall_progress) || 0,
      totalTopics: Number(topicStats.total_topics) || 0,
      completedTopics: Number(topicStats.completed_topics) || 0,
      pendingTopics: Number(topicStats.pending_topics) || 0,
      totalStudyHours: Number(sessionStats.total_study_hours) || 0,
      totalStudyMinutes: Number(sessionStats.total_study_minutes) || 0,
      completedSessions: Number(sessionStats.completed_sessions) || 0,
      pendingAssignments: Number(counts.pending_assignments) || 0,
      upcomingExams: Number(counts.upcoming_exams) || 0,
    },
    subjectProgress: subjectProgressResult.rows.map((row) => ({
      id: row.id,
      name: row.name,
      topicCount: Number(row.topic_count),
      completedTopics: Number(row.completed_topics),
      progress: Number(row.progress),
    })),
    studyTrend7d: studyTrendResult.rows,
    todayTasks: todayTasksResult.rows,
  };
};

module.exports = {
  getDashboardAnalytics,
};
