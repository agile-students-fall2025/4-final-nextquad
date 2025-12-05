const {
  getResetCodeData,
  clearResetCode,
} = require("./verifiedEmailStore");

const verifyCode = (req, res) => {
  const { email, code } = req.body;

  if (!email || !email.toLowerCase().endsWith("@nyu.edu")) {
    return res.status(400).json({
      success: false,
      error: "Only @nyu.edu email addresses are allowed.",
    });
  }

  if (!code || code.length !== 6 || !/^\d+$/.test(code)) {
    return res.status(400).json({
      success: false,
      error: "Verification code must be 6 numeric digits.",
    });
  }

  const cleanedEmail = email.trim().toLowerCase();
  const record = getResetCodeData(cleanedEmail);

  if (!record) {
    return res.status(400).json({
      success: false,
      error: "No verification code found for this email.",
    });
  }

  if (Date.now() > record.expiresAt) {
    clearResetCode(cleanedEmail);
    return res.status(410).json({
      success: false,
      error: "Verification code has expired. Please request a new one.",
    });
  }

  if (code !== record.code) {
    return res.status(401).json({
      success: false,
      error: "Incorrect verification code.",
    });
  }

  console.log("✅ Email verified:", cleanedEmail);

  return res.status(200).json({
    success: true,
    message: "Verification successful. Proceed to reset your password.",
  });
};

module.exports = { verifyCode };