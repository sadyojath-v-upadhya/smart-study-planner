const pool = require("../config/database");

const getDashboardAnalytics = async (userId) => {
  // 1. Overall Topic Stats for User
  const topicStatsResult = await pool.query(
    `
      SELECT
        COUNT(t.id) AS total_topics,
        COUNT(t.id) FILTER (WHERE t.completed = true) AS completed_topics,
        COUNT(t.id) FILTER (WHERE t.completed = false) AS pending_topics,
        CASE
          WHEN COUNT(t.id) = 0 THEN 0
          ELSE ROUND(COUNT(t.id) FILTER (WHERE t.completed = true) * 100.0 / COUNT(t.id))
        END AS overall_progress
      FROM topics t
      JOIN subjects s ON t.subject_id = s.id
      WHERE s.user_id = $1;
    `,
    [userId]
  );

  // 2. Study Time Stats for User
  const sessionStatsResult = await pool.query(
    `
      SELECT
        COALESCE(SUM(ss.duration_minutes) FILTER (WHERE ss.status = 'Completed'), 0) AS total_study_minutes,
        ROUND(COALESCE(SUM(ss.duration_minutes) FILTER (WHERE ss.status = 'Completed'), 0) / 60.0, 1) AS total_study_hours,
        COUNT(ss.id) AS total_sessions,
        COUNT(ss.id) FILTER (WHERE ss.status = 'Completed') AS completed_sessions
      FROM study_sessions ss
      JOIN topics t ON ss.topic_id = t.id
      JOIN subjects s ON t.subject_id = s.id
      WHERE s.user_id = $1;
    `,
    [userId]
  );

  // 3. Pending Assignments and Upcoming Exams Counts for User
  const countsResult = await pool.query(
    `
      SELECT
        (
          SELECT COUNT(a.id)
          FROM assignments a
          JOIN subjects s ON a.subject_id = s.id
          WHERE a.status != 'Completed' AND s.user_id = $1
        ) AS pending_assignments,
        (
          SELECT COUNT(e.id)
          FROM exams e
          JOIN subjects s ON e.subject_id = s.id
          WHERE e.exam_date >= CURRENT_DATE AND s.user_id = $1
        ) AS upcoming_exams;
    `,
    [userId]
  );

  // 4. Subject-wise Progress Breakdown for User
  const subjectProgressResult = await pool.query(
    `
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
      WHERE s.user_id = $1
      GROUP BY s.id, s.name
      ORDER BY s.id ASC;
    `,
    [userId]
  );

  // 5. 7-Day Study Trend for User
  const studyTrendResult = await pool.query(
    `
      SELECT
        TO_CHAR(d.day, 'Dy') AS day,
        TO_CHAR(d.day, 'YYYY-MM-DD') AS full_date,
        COALESCE(ROUND(SUM(ss.duration_minutes) / 60.0, 1), 0)::float AS hours
      FROM generate_series(
        CURRENT_DATE - INTERVAL '6 days',
        CURRENT_DATE,
        '1 day'::interval
      ) AS d(day)
      LEFT JOIN (
        SELECT ss_inner.session_date, ss_inner.duration_minutes
        FROM study_sessions ss_inner
        JOIN topics t_inner ON ss_inner.topic_id = t_inner.id
        JOIN subjects s_inner ON t_inner.subject_id = s_inner.id
        WHERE ss_inner.status = 'Completed' AND s_inner.user_id = $1
      ) ss ON ss.session_date = d.day::date
      GROUP BY d.day
      ORDER BY d.day ASC;
    `,
    [userId]
  );

  // 6. Today's Combined Tasks for User
  const todayTasksResult = await pool.query(
    `
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
      WHERE ss.session_date = CURRENT_DATE AND s.user_id = $1

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
      WHERE a.due_date = CURRENT_DATE AND s.user_id = $1

      ORDER BY completed ASC, id ASC;
    `,
    [userId]
  );

  const topicStats = topicStatsResult.rows[0] || {};
  const sessionStats = sessionStatsResult.rows[0] || {};
  const counts = countsResult.rows[0] || {};

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

const getStreakAndHeatmap = async (userId) => {
  // 1. Get Today and Yesterday from PostgreSQL (to avoid server timezone skew)
  const dateRefResult = await pool.query(`
    SELECT
      TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD') AS today,
      TO_CHAR(CURRENT_DATE - INTERVAL '1 day', 'YYYY-MM-DD') AS yesterday,
      TO_CHAR(CURRENT_DATE - INTERVAL '29 days', 'YYYY-MM-DD') AS thirty_days_ago
  `);
  const { today, yesterday, thirty_days_ago } = dateRefResult.rows[0];

  // 2. Fetch Daily Activity Heatmap (Last 60 days)
  const heatmapResult = await pool.query(
    `
      SELECT
        TO_CHAR(d.day, 'YYYY-MM-DD') AS date,
        TO_CHAR(d.day, 'Dy') AS day_name,
        COALESCE(SUM(ss.duration_minutes), 0)::integer AS total_minutes,
        ROUND(COALESCE(SUM(ss.duration_minutes), 0) / 60.0, 1)::float AS total_hours,
        COUNT(ss.id)::integer AS session_count
      FROM generate_series(
        CURRENT_DATE - INTERVAL '59 days',
        CURRENT_DATE,
        '1 day'::interval
      ) AS d(day)
      LEFT JOIN (
        SELECT ss_inner.session_date, ss_inner.duration_minutes, ss_inner.id
        FROM study_sessions ss_inner
        JOIN topics t ON ss_inner.topic_id = t.id
        JOIN subjects s ON t.subject_id = s.id
        WHERE ss_inner.status = 'Completed' AND s.user_id = $1
      ) ss ON ss.session_date = d.day::date
      GROUP BY d.day
      ORDER BY d.day ASC;
    `,
    [userId]
  );

  const heatmap = heatmapResult.rows.map((row) => {
    const mins = Number(row.total_minutes);
    let level = 0;
    if (mins > 0 && mins <= 30) level = 1;
    else if (mins > 30 && mins <= 60) level = 2;
    else if (mins > 60 && mins <= 120) level = 3;
    else if (mins > 120) level = 4;

    return {
      date: row.date,
      dayName: row.day_name,
      totalMinutes: mins,
      totalHours: Number(row.total_hours),
      sessionCount: Number(row.session_count),
      level,
    };
  });

  // 3. Fetch all unique historical dates where user completed study sessions
  const distinctDatesResult = await pool.query(
    `
      SELECT DISTINCT TO_CHAR(ss.session_date, 'YYYY-MM-DD') AS session_date
      FROM study_sessions ss
      JOIN topics t ON ss.topic_id = t.id
      JOIN subjects s ON t.subject_id = s.id
      WHERE ss.status = 'Completed' AND s.user_id = $1
      ORDER BY session_date DESC;
    `,
    [userId]
  );

  const dateSet = new Set(distinctDatesResult.rows.map((r) => r.session_date));
  const studiedToday = dateSet.has(today);

  // Helper to step back 1 day in YYYY-MM-DD format using UTC date math
  const getPreviousDateStr = (dateStr) => {
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    date.setUTCDate(date.getUTCDate() - 1);
    return date.toISOString().split("T")[0];
  };

  // 4. Calculate Current Streak
  let currentStreak = 0;
  if (studiedToday) {
    currentStreak = 1;
    let checkDate = getPreviousDateStr(today);
    while (dateSet.has(checkDate)) {
      currentStreak++;
      checkDate = getPreviousDateStr(checkDate);
    }
  } else if (dateSet.has(yesterday)) {
    // If not studied yet today, but studied yesterday, the streak is still active
    currentStreak = 1;
    let checkDate = getPreviousDateStr(yesterday);
    while (dateSet.has(checkDate)) {
      currentStreak++;
      checkDate = getPreviousDateStr(checkDate);
    }
  }

  // 5. Calculate Longest Historical Streak
  let longestStreak = 0;
  if (dateSet.size > 0) {
    const sortedDatesAsc = Array.from(dateSet).sort();
    let tempStreak = 1;
    longestStreak = 1;

    for (let i = 1; i < sortedDatesAsc.length; i++) {
      const prevExpected = getPreviousDateStr(sortedDatesAsc[i]);
      if (sortedDatesAsc[i - 1] === prevExpected) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    }
    longestStreak = Math.max(longestStreak, currentStreak);
  }

  // 6. Calculate 30-Day Consistency Percentage
  let activeInLast30 = 0;
  for (const dateStr of dateSet) {
    if (dateStr >= thirty_days_ago && dateStr <= today) {
      activeInLast30++;
    }
  }
  const consistencyLast30Days = Math.round((activeInLast30 / 30) * 100);

  return {
    currentStreak,
    longestStreak,
    totalActiveDays: dateSet.size,
    studiedToday,
    consistencyLast30Days,
    heatmap,
  };
};

module.exports = {
  getDashboardAnalytics,
  getStreakAndHeatmap,
};
