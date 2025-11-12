const express = require("express");
const router = express.Router();
const {
  getAdminSettings,
  updateAdminSettings,
} = require("../../controllers/admin/adminController");

router.get("/", getAdminSettings);
router.post("/", updateAdminSettings);


module.exports = router;
