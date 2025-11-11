const express = require("express");
const router = express.Router();
const {
  getUserSettings,
  updateUserSettings,
  getPrivacyPolicy,
  changeUserPassword
} = require("../../controllers/settings/settingsController");

// router.get("/", getUserSettings);
// router.post("/", updateUserSettings);
router.get("/privacy-policy", getPrivacyPolicy);
// router.post("/change-password", changeUserPassword);

module.exports = router;
