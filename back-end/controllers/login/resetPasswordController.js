const { findUserByEmail } = require("../../data/login/mockLogInData");
const {
  getLastVerifiedEmail,
  clearLastVerifiedEmail,
} = require("./verifiedEmailStore");

const resetPassword = (req, res) => {
  const { newPassword, confirmPassword } = req.body;

  if (!newPassword || !confirmPassword) {
    return res.status(400).json({
      success: false,
      error: "Both newPassword and confirmPassword are required.",
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      success: false,
      error: "Passwords do not match.",
    });
  }

  const email = getLastVerifiedEmail(); 
  if (!email) {
    return res.status(400).json({
      success: false,
      error: "No verified email found. Please verify again.",
    });
  }

  const user = findUserByEmail(email);
  if (!user) {
    return res.status(404).json({
      success: false,
      error: "User not found.",
    });
  }

  console.log("✅ [Before] Password:", user.password);
  user.password = newPassword;
  console.log("✅ [After] Password updated for", email, "->", user.password);

  clearLastVerifiedEmail(); 

  return res.status(200).json({
    success: true,
    message: "Password has been successfully reset.",
  });
};

module.exports = { resetPassword };