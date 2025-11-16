const { faker } = require("@faker-js/faker");
const { mockAdminSettings } = require("../../data/admin/mockAdminData");
const { mockReports } = require("../../data/admin/mockReportData");
const { mockAlerts } = require("../../data/admin/mockAlertData");
const { mockAdmins } = require("../../data/admin/mockAdminData");

//settings

// get request for admin
const getAdminSettings = (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: mockAdminSettings,
    });
  } catch (error) {
    console.error("Error fetching admin settings:", error);
    res.status(500).json({
      success: false,
      error: "Server error while fetching admin settings",
    });
  }
};

// POST (update) admin notification settings
const updateAdminSettings = (req, res) => {
  const updates = req.body;

  if (!updates || typeof updates !== "object") {
    return res.status(400).json({
      success: false,
      error: "Invalid request body. Expected an object with notification updates.",
    });
  }

  try {
    // Update mock settings in memory
    Object.keys(updates).forEach((key) => {
      if (mockAdminSettings.notifications.hasOwnProperty(key)) {
        mockAdminSettings.notifications[key] = updates[key];
      }
    });

    mockAdminSettings.updatedAt = new Date().toISOString();

    return res.status(200).json({
      success: true,
      data: mockAdminSettings,
      message: "Admin notification settings updated successfully.",
    });
  } catch (error) {
    console.error("Error updating admin settings:", error);
    return res.status(500).json({
      success: false,
      error: "Server error while updating admin settings.",
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


//emergency alerts
// get all emergency alerts
const getEmergencyAlerts = (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: mockAlerts,
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
const createEmergencyAlert = (req, res) => {
  const { message, sentBy = "Admin" } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({
      success: false,
      error: "Message is required to send an alert.",
    });
  }

  try {
    const newAlert = {
      id: faker.string.uuid(),
      message: message.trim(),
      sentAt: new Date().toISOString(),
      sentBy,
    };

    mockAlerts.unshift(newAlert); 

    res.status(201).json({
      success: true,
      message: "Emergency alert sent successfully.",
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
const adminSignIn = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: "Email and password are required" });
  }

  const admin = mockAdmins.find(
    (a) => a.email === email && a.password === password
  );

  if (!admin) {
    return res.status(401).json({ success: false, error: "Invalid credentials" });
  }

  res.json({
    success: true,
    message: "Admin signed in successfully",
    data: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    },
  });
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
