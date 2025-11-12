const { setLastVerifiedEmail } = require("./verifiedEmailStore");

const verifyCode = (req, res) => {
  const { email, code } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, error: "Email is required." });
  }

  if (!code || code.length !== 4 || !/^\d+$/.test(code)) {
    return res.status(400).json({
      success: false,
      error: "Verification code must be 4 numeric digits.",
    });
  }

  if (code !== "1234") {
    return res.status(401).json({
      success: false,
      error: "Incorrect verification code.",
    });
  }

  setLastVerifiedEmail(email);
  console.log("✅ Email verified:", email);

  return res.status(200).json({
    success: true,
    message: "Verification successful. Proceed to reset your password.",
  });
};

module.exports = { verifyCode };