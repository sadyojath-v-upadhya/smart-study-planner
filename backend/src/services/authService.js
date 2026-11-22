const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");

/**
 * Register a new user
 */
const registerUser = async (name, email, password) => {
  const normalizedEmail = email.trim().toLowerCase();

  // Check if email already exists
  const existingUserRes = await pool.query(
    "SELECT id FROM users WHERE LOWER(email) = $1",
    [normalizedEmail]
  );

  if (existingUserRes.rows.length > 0) {
    const error = new Error("An account with this email already exists");
    error.statusCode = 409;
    throw error;
  }

  // Hash password using bcryptjs with 10 salt rounds
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  // Insert user into PostgreSQL
  const result = await pool.query(
    `
      INSERT INTO users (name, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, name, email, created_at
    `,
    [name.trim(), normalizedEmail, passwordHash]
  );

  const newUser = result.rows[0];

  // Generate signed JWT token
  const token = jwt.sign(
    { userId: newUser.id, email: newUser.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

  return { user: newUser, token };
};

/**
 * Log in an existing user
 */
const loginUser = async (email, password) => {
  const normalizedEmail = email.trim().toLowerCase();

  // Find user by email
  const result = await pool.query(
    "SELECT id, name, email, password_hash, created_at FROM users WHERE LOWER(email) = $1",
    [normalizedEmail]
  );

  if (result.rows.length === 0) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const user = result.rows[0];

  // Verify password with bcryptjs
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  // Generate signed JWT token
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

  // Return user info (omit password_hash) and token
  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    created_at: user.created_at,
  };

  return { user: safeUser, token };
};

/**
 * Get user profile by ID
 */
const getUserById = async (id) => {
  const result = await pool.query(
    "SELECT id, name, email, created_at FROM users WHERE id = $1",
    [id]
  );

  return result.rows[0] || null;
};

module.exports = {
  registerUser,
  loginUser,
  getUserById,
};
