const User = require("../../models/User");
const bcrypt = require("bcrypt");
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

// PUT request to update user's profile picture
const updateProfilePicture = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { profileImage } = req.body;

    if (!profileImage) {
      return res.status(400).json({
        success: false,
        error: "Profile image is required",
      });
    }

    // Update user's profile image
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profileImage },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: { profileImage: updatedUser.profileImage },
      message: "Profile picture updated successfully",
    });
  } catch (error) {
    console.error("Error updating profile picture:", error);
    res.status(500).json({
      success: false,
      error: "Server error while updating profile picture",
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
const changeUserPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // basic validation
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

    // find user 
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found.",
      });
    }

    // check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Current password is incorrect.",
      });
    }

    // hash and update password 
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });

  } catch (err) {
    console.error("Error changing password:", err);
    return res.status(500).json({
      success: false,
      error: "Server error while changing password.",
    });
  }
};

// PUT request to update full name with rate limiting (3 times per year)
const updateFullName = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { firstName, lastName } = req.body;

    if (!firstName || !lastName || firstName.trim() === '' || lastName.trim() === '') {
      return res.status(400).json({
        success: false,
        error: "First name and last name are required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Check rate limit: 3 name changes per year (365 days)
    const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    const recentChanges = user.nameChangeHistory?.filter(
      change => new Date(change.changedAt) > oneYearAgo
    ) || [];

    if (recentChanges.length >= 3) {
      const oldestChange = recentChanges[0];
      const nextAllowedDate = new Date(oldestChange.changedAt.getTime() + 365 * 24 * 60 * 60 * 1000);
      return res.status(429).json({
        success: false,
        error: "You can only change your name 3 times per year",
        nextAvailableChange: nextAllowedDate.toISOString(),
      });
    }

    // Update name and add to history
    user.firstName = firstName.trim();
    user.lastName = lastName.trim();
    
    if (!user.nameChangeHistory) {
      user.nameChangeHistory = [];
    }
    user.nameChangeHistory.push({
      firstName: user.firstName,
      lastName: user.lastName,
      changedAt: new Date()
    });

    await user.save();

    res.status(200).json({
      success: true,
      data: {
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: `${user.firstName} ${user.lastName}`,
      },
      message: "Full name updated successfully",
    });
  } catch (error) {
    console.error("Error updating full name:", error);
    res.status(500).json({
      success: false,
      error: "Server error while updating full name",
    });
  }
};

// PUT request to update graduation year (unlimited)
const updateGraduationYear = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { graduationYear } = req.body;

    if (graduationYear === null || graduationYear === undefined) {
      return res.status(400).json({
        success: false,
        error: "Graduation year is required",
      });
    }

    const year = parseInt(graduationYear, 10);
    if (isNaN(year) || year < 2000 || year > 2100) {
      return res.status(400).json({
        success: false,
        error: "Graduation year must be a valid year between 2000 and 2100",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { graduationYear: year },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: { graduationYear: user.graduationYear },
      message: "Graduation year updated successfully",
    });
  } catch (error) {
    console.error("Error updating graduation year:", error);
    res.status(500).json({
      success: false,
      error: "Server error while updating graduation year",
    });
  }
};

module.exports = {
  getUserSettings,
  updateUserSettings,
  updateProfilePicture,
  updateFullName,
  updateGraduationYear,
  getPrivacyPolicy,
  changeUserPassword,
};
