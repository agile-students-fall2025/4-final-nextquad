const { faker } = require("@faker-js/faker");
const { mockReports } = require("../../data/admin/mockReportData");
const { mockAlerts } = require("../../data/admin/mockAlertData");
const { mockAdmins } = require("../../data/admin/mockAdminData");
const Admin = require('../../models/Admin');
const AdminSettings = require('../../models/AdminSettings');
const AdminEmergencyAlert = require('../../models/AdminEmergencyAlert');
const { jwtSecret, jwtOptions } = require('../../config/jwt-config');
const jwt = require('jsonwebtoken');

//settings

// get request for admin
const getAdminSettings = async (req, res) => {

  try {
    const adminId = req.user._id;

    let settings = await AdminSettings.findOne({ admin: adminId });

    // If no settings exist yet, create defaults automatically
    if (!settings) {
      settings = new AdminSettings({ admin: adminId });
      await settings.save();
    }


    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Error fetching admin settings:", error);
    res.status(500).json({
      success: false,
      error: "Server error while fetching admin settings",
    });
  }
};

// put request to update admin settings
const updateAdminSettings = async (req, res) => {
  try {
    const adminId = req.user._id;
    const updates = req.body.notifications; 

    if (!updates) {
      return res.status(400).json({
        success: false,
        error: "No notifications provided for update",
      });
    }

    // Update notifications in DB
    const settings = await AdminSettings.findOneAndUpdate(
      { admin: adminId },
      { notifications: updates },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.status(200).json({
      success: true,
      data: settings,
      message: "Admin notification settings updated successfully",
    });
  } catch (error) {
    console.error("Error updating admin settings:", error);
    res.status(500).json({
      success: false,
      error: "Server error while updating admin settings",
    });
  }
};

//admin user reports

// GET all reports
const getAllReports = (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: mockReports,
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({
      success: false,
      error: "Server error while fetching reports",
    });
  }
};

// POST create a new report
const createReport = (req, res) => {
  const { username, reason } = req.body;

  if (!username || !reason) {
    return res.status(400).json({
      success: false,
      error: "Username and reason are required to submit a report.",
    });
  }

  try {
    const newReport = {
      id: faker.string.uuid(),
      username,
      reason,
      reportedAt: new Date().toISOString(),
    };

    // Push into mock data
    mockReports.push(newReport);

    res.status(201).json({
      success: true,
      message: "User report submitted successfully.",
      data: newReport,
    });
  } catch (error) {
    console.error("Error submitting report:", error);
    res.status(500).json({
      success: false,
      error: "Server error while submitting report.",
    });
  }
};

// emergency alerts
// get emergency alerts

const getEmergencyAlerts = async (req, res) => {
  try {
    const alerts = await AdminEmergencyAlert.find()
      .sort({ createdAt: -1 }); 

    res.status(200).json({
      success: true,
      data: alerts,
    });
  } catch (error) {
    console.error("Error fetching emergency alerts:", error);
    res.status(500).json({
      success: false,
      error: "Server error while fetching emergency alerts.",
    });
  }
};

// post create emergency alert
const createEmergencyAlert = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: "Message is required to send an alert.",
      });
    }

    
    const adminId = req.user.id;

    const newAlert = await AdminEmergencyAlert.create({
      admin: adminId,
      message: message.trim()
    });

    res.status(201).json({
      success: true,
      message: "Emergency alert created successfully.",
      data: newAlert,
    });
  } catch (error) {
    console.error("Error creating alert:", error);
    res.status(500).json({
      success: false,
      error: "Server error while sending alert.",
    });
  }
};

// post admin sign-in
const adminSignIn = async (req, res) => {
  const { email, password } = req.body;
  console.log("Sign-in request body:", req.body);
  // validate request
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: "Email and password are required",
    });
  }

  try {
    // find admin by email
    const admin = await Admin.findOne({ email });
    console.log("User found in DB:", admin);
    if (!admin || !admin.validPassword(password)) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    // return JWT and admin info
    return res.json({
      success: true,
      message: "Admin signed in successfully",
      data: admin.toAuthJSON(),
    });
  } catch (err) {
    console.error("Admin sign-in error:", err);
    return res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};


module.exports = {
  getAdminSettings,
  updateAdminSettings,
  getAllReports,
  createReport,
  getEmergencyAlerts,
  createEmergencyAlert,
  adminSignIn,
};
