const express = require("express");
const router = express.Router();

const authenticateToken = require("../../middleware/authenticateToken");

const {
  getUserSettings,
  updateUserSettings,
  updateProfilePicture,
  getPrivacyPolicy,
  changeUserPassword,
} = require("../../controllers/settings/settingsController");

// Get user settings
router.get("/", authenticateToken, getUserSettings);

// Update user settings
router.put("/", authenticateToken, updateUserSettings);

// Update profile picture
router.put("/profile-picture", authenticateToken, updateProfilePicture);

// Public privacy policy
router.get("/privacy-policy", getPrivacyPolicy);

// Change password
router.put("/change-password", authenticateToken, changeUserPassword);

module.exports = router;