/**
 * Handles "Forgot Password" request
 * POST /api/auth/forgot-password
 * Sends verification code to user email.
 */

const { sendVerificationEmail } = require("./emailSender");
const {
  saveResetCode,
} = require("./verifiedEmailStore"); // your updated store with saveResetCode()

// Generate random 6-digit code
const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // e.g., "548201"
};

const sendResetCode = async (req, res) => {
  const { email } = req.body;

  // ✅ Only allow @nyu.edu email
  if (!email || !email.toLowerCase().endsWith("@nyu.edu")) {
    return res.status(400).json({
      success: false,
      error: "Only @nyu.edu email addresses are allowed.",
    });
  }

  try {
    const code = generateCode();

    // Save code to in-memory store with expiry
    saveResetCode(email.trim().toLowerCase(), code);

    // Send code via email
    await sendVerificationEmail(email, code);

    return res.status(200).json({
      success: true,
      message: `Verification code sent to ${email}`,
    });
  } catch (err) {
    console.error("Error sending reset code:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to send verification code. Please try again later.",
    });
  }
};

module.exports = { sendResetCode };