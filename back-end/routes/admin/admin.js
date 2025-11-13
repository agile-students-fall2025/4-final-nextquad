const express = require("express");
const router = express.Router();

const {
  getAdminSettings,
  updateAdminSettings,
  getAllReports,
  createReport,
} = require("../../controllers/admin/adminController");


router.get("/", getAdminSettings);
router.post("/", updateAdminSettings);

router.get("/reports", getAllReports);
router.post("/reports", createReport);

module.exports = router;

