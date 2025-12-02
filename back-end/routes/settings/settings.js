const express = require("express");
const passport = require("passport");
const router = express.Router();
const {
  getUserSettings,
  updateUserSettings,
  getPrivacyPolicy,
  changeUserPassword,
} = require("../../controllers/settings/settingsController");

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  getUserSettings);

router.put("/",
  passport.authenticate("jwt", { session: false }),
  updateUserSettings);

router.get("/privacy-policy", getPrivacyPolicy);
router.post("/change-password", changeUserPassword);

module.exports = router;
