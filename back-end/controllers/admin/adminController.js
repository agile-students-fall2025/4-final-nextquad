const Admin = require("../../models/Admin");
const AdminSettings = require("../../models/AdminSettings");
const AdminEmergencyAlert = require("../../models/AdminEmergencyAlert");
const AdminReportUser = require("../../models/AdminReportUser");
const { jwtSecret, jwtOptions } = require("../../config/jwt-config");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const UserSettings = require("../../models/UserSettings");
const sendNotification = require("../../utils/sendNotification");
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
const getAllReports = async (req, res) => {
  try {
    // Fetch all reports from the database
    const reports = await AdminReportUser.find()
      .populate("admin", "username email")
      .populate("username", "username email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: reports,
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({
      success: false,
      error: "Server error while fetching reports",
    });
  }
};

// put create a new report
const createReport = async (req, res) => {
  const { username, reason } = req.body;

  console.log("Incoming report request:", { username, reason });

  if (!username || !reason) {
    return res.status(400).json({
      success: false,
      error: "Username and reason are required to submit a report.",
    });
  }

  const adminId = req.user.id;
  console.log("Admin making report:", adminId);

  try {
    // create new report entry
    console.log("Creating new report entry in DB...");
    const newReport = await AdminReportUser.create({
      admin: adminId,
      username,
      reason,
    });

    console.log("Report created successfully with ID:", newReport._id);

    // Update user's banCounter and isBanned status
    const user = await User.findById(username); // username is  user ID
    if (!user) {
      console.warn(`User ${username} not found for ban update`);
    } else {
      user.banCounter += 1;
      if (user.banCounter >= 3) {
        user.isBanned = true;
        console.log(`User ${username} has reached 3 reports and is now banned`);
      } else {
        console.log(
          `User ${username} banCounter updated to ${user.banCounter}`
        );
      }
      await user.save();
    }

    res.status(201).json({
      success: true,
      message: "User report submitted successfully.",
      data: { report: newReport, user },
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
    const alerts = await AdminEmergencyAlert.find().sort({ createdAt: -1 });

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

    // Save alert to DB
    const newAlert = await AdminEmergencyAlert.create({
      admin: adminId,
      message: message.trim(),
    });

    // Find users who enabled emergencyAlerts
    const recipients = await UserSettings.find({
      "notifications.emergencyAlerts": true,
    })
      .select("user")
      .lean(); // lean() for performance

    // Send notifications to eligible users
    const notificationPromises = recipients.map((setting) => {
      const recipientId = setting.user?.toString(); // Ensure it's a string
      if (!recipientId) return null;

      return sendNotification({
        recipientId,
        senderId: adminId,
        type: "emergency_alert",
        message: message.trim(),
      });
    });

    // Filter out nulls and wait for all notifications to send
    await Promise.all(notificationPromises.filter(Boolean));

    res.status(201).json({
      success: true,
      message: "Emergency alert created and notifications sent successfully.",
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
