const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authenticateToken = require("../middleware/authMiddleware");

// Public endpoints
router.post("/register", authController.register);
router.post("/login", authController.login);

// Protected endpoint to fetch current authenticated user profile
router.get("/me", authenticateToken, authController.getMe);

module.exports = router;
