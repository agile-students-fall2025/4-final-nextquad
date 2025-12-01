const { mockUserSettings, mockPrivacyPolicy } = require("../../data/settings/mockSettingsData");
const PrivacyPolicy = require("../../models/PrivacyPolicy");


// get user's current notification settings
const getUserSettings = (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: mockUserSettings,
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({
      success: false,
      error: "Server error while fetching user settings",
    });
  }
};

// update notification settings
const updateUserSettings = (req, res) => {
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
      if (mockUserSettings.notifications.hasOwnProperty(key)) {
        mockUserSettings.notifications[key] = updates[key];
      }
    });

    mockUserSettings.updatedAt = new Date().toISOString();

    return res.status(200).json({
      success: true,
      data: mockUserSettings,
      message: "User notification settings updated successfully.",
    });
  } catch (error) {
    console.error("Error updating user settings:", error);
    return res.status(500).json({
      success: false,
      error: "Server error while updating user settings.",
    });
  }
};

// get Privacy Policy
const getPrivacyPolicy = async (req, res) => {
  try {
    let policy = await PrivacyPolicy.findOne();

    return res.status(200).json({
      success: true,
      data: policy,
    });
  } catch (error) {
    console.error("Error fetching privacy policy:", error);
    return res.status(500).json({
      success: false,
      error: "Server error while fetching privacy policy",
    });
  }
};

module.exports = { getPrivacyPolicy };


// change user password
const changeUserPassword = (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({
      success: false,
      error: "All password fields are required.",
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      success: false,
      error: "New password and confirmation do not match.",
    });
  }

  try {
    // UPDATE WHEN PROF SHOWS PASSWORD HANDLING
    const mockCurrentPassword = "Password123";

    if (currentPassword !== mockCurrentPassword) {
      return res.status(401).json({
        success: false,
        error: "Current password is incorrect.",
      });
    }

    // Mock updating password
    console.log("Password successfully changed to:", newPassword);

    return res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    return res.status(500).json({
      success: false,
      error: "Server error while changing password.",
    });
  }
};

module.exports = {
  getUserSettings,
  updateUserSettings,
  getPrivacyPolicy,
  changeUserPassword,
};
