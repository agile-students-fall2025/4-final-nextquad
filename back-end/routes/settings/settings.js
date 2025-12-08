const express = require("express");
const router = express.Router();

const authenticateToken = require("../../middleware/authenticateToken");

const {
  getUserSettings,
  updateUserSettings,
  updateProfilePicture,
  updateFullName,
  updateGraduationYear,
  getPrivacyPolicy,
  changeUserPassword,
} = require("../../controllers/settings/settingsController");

// Get user settings
router.get("/", authenticateToken, getUserSettings);

// Update user settings
router.put("/", authenticateToken, updateUserSettings);

// Update profile picture
router.put("/profile-picture", authenticateToken, updateProfilePicture);

// Update full name (with rate limiting)
router.put("/full-name", authenticateToken, updateFullName);

// Update graduation year (unlimited)
router.put("/graduation-year", authenticateToken, updateGraduationYear);

// Public privacy policy
router.get("/privacy-policy", getPrivacyPolicy);

// Change password
router.put("/change-password", authenticateToken, changeUserPassword);

module.exports = router;