const { mockAdminSettings } = require("../../data/admin/mockAdminData");

// GET admin notification settings
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

// ✅ Export properly
module.exports = {
  getAdminSettings,
  updateAdminSettings,
};
