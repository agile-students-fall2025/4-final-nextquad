const express = require("express");
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
 * @desc    Register a new user (mock)
 */
router.post("/signup", signUpUser);

/**
 * @route   POST /api/auth/signin
 * @desc    Authenticate user and return mock data
 */
router.post("/signin", signIn);

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