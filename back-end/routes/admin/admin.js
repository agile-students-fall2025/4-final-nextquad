const express = require("express");
const router = express.Router();

const {
  getAdminSettings,
  updateAdminSettings,
  getAllReports,
  createReport,
  getEmergencyAlerts,
  createEmergencyAlert,
} = require("../../controllers/admin/adminController");


router.get("/", getAdminSettings);
router.post("/", updateAdminSettings);

router.get("/reports", getAllReports);
router.post("/reports", createReport);


router.get("/alerts", getEmergencyAlerts);
router.post("/alerts", createEmergencyAlert);

module.exports = router;

