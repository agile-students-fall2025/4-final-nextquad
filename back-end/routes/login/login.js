const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

// Import controllers
const { signUpUser } = require("../../controllers/login/signUpController");
const { signIn } = require("../../controllers/login/signInController");
const { sendResetCode } = require("../../controllers/login/forgotPasswordController");
const { resetPassword } = require("../../controllers/login/resetPasswordController");
const { verifyCode } = require("../../controllers/login/verifyCodeController");
const { setupProfile } = require("../../controllers/login/profileSetupController");

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user
 */
router.post(
  "/signup",
  [
    body("email").isEmail().withMessage("Please provide a valid email."),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters."),
  ],
  signUpUser
);

/**
 * @route   POST /api/auth/signin
 * @desc    Authenticate user
 */
router.post(
  "/signin",
  [
    body("email").isEmail().withMessage("Please provide a valid email."),
    body("password").notEmpty().withMessage("Password is required."),
  ],
  signIn
);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send verification code for password reset
 */
router.post("/forgot-password", sendResetCode);

/**
 * @route   POST /api/auth/verify-code
 * @desc    Verify the 4-digit code sent to email
 */
router.post("/verify-code", verifyCode);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password after verification
 */
router.post("/reset-password", resetPassword);

/**
 * @route   POST /api/auth/profile-setup
 * @desc    Set up user profile after registration
 */
router.post("/profile-setup", setupProfile);

module.exports = router;