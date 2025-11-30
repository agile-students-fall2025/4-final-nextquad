const express = require("express");
const passport = require("passport");
const router = express.Router();

const {
  getAdminSettings,
  updateAdminSettings,
  getAllReports,
  createReport,
  getEmergencyAlerts,
  createEmergencyAlert,
  adminSignIn,
} = require("../../controllers/admin/adminController");

//doesn't need to be protected since it's for signing in
router.post("/signin", adminSignIn);


router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  getAdminSettings
);
router.put(
  "/",
  passport.authenticate("jwt", { session: false }),
  updateAdminSettings
);

router.get("/reports", getAllReports);
router.post("/reports", createReport);


router.get(
  "/alerts",
  passport.authenticate("jwt", { session: false }),
  getEmergencyAlerts
);

router.post(
  "/alerts", 
  passport.authenticate("jwt", { session: false }),
  createEmergencyAlert);


module.exports = router;

