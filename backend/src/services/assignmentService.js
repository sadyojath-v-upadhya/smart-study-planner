const pool = require("../config/database");

const getAllAssignments = async (filters = {}, userId) => {
  const conditions = ["s.user_id = $1"];
  const params = [userId];

  if (filters.subjectId) {
    params.push(filters.subjectId);
    conditions.push(`a.subject_id = $${params.length}`);
  }

  if (filters.status) {
    params.push(filters.status);
    conditions.push(`a.status = $${params.length}`);
  }

  if (filters.priority) {
    params.push(filters.priority);
    conditions.push(`a.priority = $${params.length}`);
  }

  const whereClause = `WHERE ${conditions.join(" AND ")}`;

  const result = await pool.query(
    `
      SELECT
        a.id,
        a.subject_id,
        a.title,
        a.description,
        TO_CHAR(a.due_date, 'YYYY-MM-DD') AS due_date,
        a.priority,
        a.status,
        a.created_at,
        s.name AS subject_name,
        (a.due_date - CURRENT_DATE) AS days_left
      FROM assignments a
      JOIN subjects s ON a.subject_id = s.id
      ${whereClause}
      ORDER BY a.due_date ASC, a.id ASC
    `,
    params
  );

  return result.rows;
};

const getAssignmentById = async (id, userId) => {
  const result = await pool.query(
    `
      SELECT
        a.id,
        a.subject_id,
        a.title,
        a.description,
        TO_CHAR(a.due_date, 'YYYY-MM-DD') AS due_date,
        a.priority,
        a.status,
        a.created_at,
        s.name AS subject_name,
        (a.due_date - CURRENT_DATE) AS days_left
      FROM assignments a
      JOIN subjects s ON a.subject_id = s.id
      WHERE a.id = $1 AND s.user_id = $2
    `,
    [id, userId]
  );

  return result.rows[0];
};

const createAssignment = async (
  subjectId,
  title,
  description = "",
  dueDate,
  priority = "Medium",
  status = "Pending",
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
      INSERT INTO assignments (
        subject_id,
        title,
        description,
        due_date,
        priority,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `,
    [subjectId, title, description, dueDate, priority, status]
  );

  return getAssignmentById(result.rows[0].id, userId);
};

const updateAssignment = async (
  id,
  title,
  description,
  dueDate,
  priority,
  status,
  userId
) => {
  const existing = await getAssignmentById(id, userId);
  if (!existing) return null;

  await pool.query(
    `
      UPDATE assignments
      SET
        title = $1,
        description = $2,
        due_date = $3,
        priority = $4,
        status = $5,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
    `,
    [title, description, dueDate, priority, status, id]
  );

  return getAssignmentById(id, userId);
};

const updateAssignmentStatus = async (id, status, userId) => {
  const existing = await getAssignmentById(id, userId);
  if (!existing) return null;

  await pool.query(
    `
      UPDATE assignments
      SET
        status = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `,
    [status, id]
  );

  return getAssignmentById(id, userId);
};

const deleteAssignment = async (id, userId) => {
  const existing = await getAssignmentById(id, userId);
  if (!existing) return null;

  const result = await pool.query(
    "DELETE FROM assignments WHERE id = $1 RETURNING *",
    [id]
  );

  return result.rows[0];
};

module.exports = {
  getAllAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  updateAssignmentStatus,
  deleteAssignment,
};
