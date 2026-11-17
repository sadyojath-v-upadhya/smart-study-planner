const pool = require("../config/database");

const getStudyRecommendations = async (limit = 4) => {
  const result = await pool.query(`
    WITH subject_stats AS (
      SELECT
        s.id AS subject_id,
        s.name AS subject_name,
        CASE
          WHEN COUNT(t_all.id) = 0 THEN 0
          ELSE ROUND(COUNT(t_all.id) FILTER (WHERE t_all.completed = true) * 100.0 / COUNT(t_all.id))
        END AS subject_progress,
        MIN(e.exam_date - CURRENT_DATE) FILTER (WHERE e.exam_date >= CURRENT_DATE) AS nearest_exam_days,
        (
          SELECT e2.title
          FROM exams e2
          WHERE e2.subject_id = s.id AND e2.exam_date >= CURRENT_DATE
          ORDER BY e2.exam_date ASC
          LIMIT 1
        ) AS nearest_exam_title
      FROM subjects s
      LEFT JOIN topics t_all ON s.id = t_all.subject_id
      LEFT JOIN exams e ON s.id = e.subject_id
      GROUP BY s.id, s.name
    )
    SELECT
      t.id AS topic_id,
      t.name AS topic_name,
      t.difficulty,
      t.description AS topic_description,
      ss_stat.subject_id,
      ss_stat.subject_name,
      ss_stat.subject_progress,
      ss_stat.nearest_exam_days,
      ss_stat.nearest_exam_title,
      COUNT(sess.id) FILTER (WHERE sess.status = 'Completed') AS completed_sessions_count
    FROM topics t
    JOIN subject_stats ss_stat ON t.subject_id = ss_stat.subject_id
    LEFT JOIN study_sessions sess ON t.id = sess.topic_id
    WHERE t.completed = false
    GROUP BY
      t.id,
      t.name,
      t.difficulty,
      t.description,
      ss_stat.subject_id,
      ss_stat.subject_name,
      ss_stat.subject_progress,
      ss_stat.nearest_exam_days,
      ss_stat.nearest_exam_title;
  `);

  const recommendations = result.rows.map((row) => {
    let score = 0;
    const reasons = [];

    const examDays =
      row.nearest_exam_days !== null ? Number(row.nearest_exam_days) : null;
    const progress = Number(row.subject_progress) || 0;
    const sessions = Number(row.completed_sessions_count) || 0;

    // 1. Exam Proximity Weight
    if (examDays !== null) {
      if (examDays <= 3) {
        score += 60;
        reasons.push(
          `${row.nearest_exam_title || "Exam"} is in ${
            examDays === 0 ? "today" : examDays === 1 ? "tomorrow" : `${examDays} days`
          }`
        );
      } else if (examDays <= 7) {
        score += 40;
        reasons.push(
          `${row.nearest_exam_title || "Exam"} is in ${examDays} days`
        );
      } else if (examDays <= 14) {
        score += 20;
        reasons.push(
          `${row.nearest_exam_title || "Exam"} in 2 weeks`
        );
      }
    }

    // 2. Topic Difficulty Weight
    if (row.difficulty === "Hard") {
      score += 30;
      reasons.push("High difficulty topic requiring focused preparation");
    } else if (row.difficulty === "Medium") {
      score += 15;
    } else {
      score += 5;
    }

    // 3. Subject Progress Lag Weight
    if (progress < 30) {
      score += 25;
      reasons.push(`${row.subject_name} is lagging behind (${progress}% syllabus done)`);
    } else if (progress < 60) {
      score += 15;
      reasons.push(`${row.subject_name} is at ${progress}% progress`);
    }

    // 4. Stale / Never studied
    if (sessions === 0) {
      score += 10;
      reasons.push("No completed study sessions logged yet");
    }

    // Fallback reason if none triggered
    if (reasons.length === 0) {
      reasons.push("Uncompleted topic in your study plan");
    }

    // Determine Urgency level
    let urgency = "Recommended";
    if (score >= 70) {
      urgency = "Urgent";
    } else if (score >= 40) {
      urgency = "High Priority";
    }

    // Recommended Duration based on difficulty
    const recommendedDuration =
      row.difficulty === "Hard" ? 60 : row.difficulty === "Medium" ? 45 : 30;

    return {
      topicId: row.topic_id,
      topicName: row.topic_name,
      difficulty: row.difficulty,
      description: row.topic_description,
      subjectId: row.subject_id,
      subjectName: row.subject_name,
      subjectProgress: progress,
      score,
      urgency,
      reasons,
      primaryReason: reasons[0],
      recommendedDuration,
    };
  });

  // Rank by score descending
  recommendations.sort((a, b) => b.score - a.score);

  return recommendations.slice(0, limit);
};

module.exports = {
  getStudyRecommendations,
};
