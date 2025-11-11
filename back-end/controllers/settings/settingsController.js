const { mockUserSettings, mockPrivacyPolicy } = require("../../data/settings/mockSettingsData");

// //get user's current notification settings
// const getUserSettings = (req, res) => {
//   try {
//     res.status(200).json({
//       success: true,
//       data: mockUserSettings,
//     });
//   } catch (error) {
//     console.error("Error fetching settings:", error);
//     res.status(500).json({
//       success: false,
//       error: "Server error while fetching user settings",
//     });
//   }
// };

//post for updating user's notification settings

// const updateUserSettings = (req, res) => {};

//get privacy policy
const getPrivacyPolicy = (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: mockPrivacyPolicy,
    });
  } catch (error) {
    console.error("Error fetching privacy policy:", error);
    res.status(500).json({
      success: false,
      error: "Server error while fetching privacy policy",
    });
  }
};

//post for changing user password
// const changeUserPassword = (req, res) => {};

module.exports = {
//   getUserSettings,
//   updateUserSettings,
  getPrivacyPolicy,
//   changeUserPassword,
};
