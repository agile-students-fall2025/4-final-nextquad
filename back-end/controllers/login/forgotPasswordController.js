/**
 * Handles "Forgot Password" request
 * POST /api/auth/forgot-password
 * Mock implementation for sending verification code to user email.
 */

const sendResetCode = (req, res) => {
  const { email } = req.body;

  // Check for missing email
  if (!email) {
    return res.status(400).json({
      success: false,
      error: "Email is required.",
    });
  }

  // Simple format validation
  if (!email.includes("@") || !email.includes(".")) {
    return res.status(400).json({
      success: false,
      error: "Please enter a valid email address.",
    });
  }

  // Generate mock verification code
  const verificationCode = "1234"; // For mock testing only

  // Simulate sending email
  console.log(`📧 Mock: Sent verification code ${verificationCode} to ${email}`);

  // Send response
  return res.status(200).json({
    success: true,
    message: `Verification code sent to ${email}`,
    code: verificationCode,
  });
};

// Export for router
module.exports = { sendResetCode };