const bcrypt = require("bcrypt");
const User = require("../../models/User");
const { getResetCodeData, clearResetCode } = require("./verifiedEmailStore");

const resetPassword = async (req, res) => {
  const { email, code, newPassword, confirmPassword } = req.body;

  // 👉👉 在这里加上 debug log（位置1）
  console.log("🟦 Reset request email:", email);
  console.log("🟦 Code from request:", code);

  // Validate email
  if (!email || !email.toLowerCase().endsWith("@nyu.edu")) {
    return res.status(400).json({ success: false, error: "Invalid email." });
  }
  
  // Validate code
  const cleanedEmail = email.trim().toLowerCase();
  const record = getResetCodeData(cleanedEmail);
  console.log("🟩 Stored reset record:", record); //测试
  if (!record || record.code !== code) {
    return res.status(400).json({ success: false, error: "Invalid or expired code." });
  }

  if (Date.now() > record.expiresAt) {
    clearResetCode(cleanedEmail);
    return res.status(410).json({ success: false, error: "Code has expired." });
  }

  // Validate passwords
  if (!newPassword || !confirmPassword) {
    return res.status(400).json({ success: false, error: "Missing passwords." });
  }
  if (newPassword !== confirmPassword) {
    return res.status(400).json({ success: false, error: "Passwords do not match." });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    clearResetCode(cleanedEmail); // Optional: clear after successful reset

    return res.status(200).json({ success: true, message: "Password reset successful." });
  } catch (err) {
    console.error("Error resetting password:", err);
    return res.status(500).json({ success: false, error: "Server error." });
  }
};

module.exports = { resetPassword };