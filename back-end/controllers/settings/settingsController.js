const { mockUserSettings, mockPrivacyPolicy } = require("../../data/settings/mockSettingsData");
const UserSettings = require("../../models/UserSettings");
const PrivacyPolicy = require("../../models/PrivacyPolicy");


// get user's current notification settings
const getUserSettings = async (req, res) => {
  try {
    const userId = req.user.userId;

    let settings = await UserSettings.findOne({ user: userId });

    // If no settings exist yet, create defaults automatically
    if (!settings) {
      settings = new UserSettings({ user: userId });
      await settings.save();
    }

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Error fetching user settings:", error);
    res.status(500).json({
      success: false,
      error: "Server error while fetching user settings",
    });
  }
};

// PUT request to update user's notification settings
const updateUserSettings = async (req, res) => {
  try {
    const userId = req.user.userId;
    const updates = req.body.notifications;

    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({
        success: false,
        error: "Invalid request body. Expected an object with notification updates.",
      });
    }

    // Update notifications in DB
    const settings = await UserSettings.findOneAndUpdate(
      { user: userId },
      { notifications: updates },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      success: true,
      data: settings,
      message: "User notification settings updated successfully",
    });
  } catch (error) {
    console.error("Error updating user settings:", error);
    res.status(500).json({
      success: false,
      error: "Server error while updating user settings",
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
