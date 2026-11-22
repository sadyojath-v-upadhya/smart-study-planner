const jwt = require("jsonwebtoken");

/**
 * Authentication Middleware
 * Protects private endpoints by verifying the incoming JSON Web Token (JWT)
 * passed in the `Authorization: Bearer <token>` header.
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Access denied. Authentication token required.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Contains { userId, email, iat, exp }
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Your session has expired. Please log in again.",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid authentication token.",
    });
  }
};

module.exports = authenticateToken;
