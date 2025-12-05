const User = require("../../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

const signUpUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { email, password } = req.body;

  // Check if email ends with @nyu.edu
  if (!email.toLowerCase().endsWith("@nyu.edu")) {
    return res.status(400).json({ success: false, message: "Only @nyu.edu emails are allowed." });
  }
  
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "Email already registered." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await User.create({ email, password: hashedPassword });

    // Create JWT
    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: `${process.env.JWT_EXP_DAYS || 7}d` }
    );

    // Return success message
    return res.status(201).json({
      success: true,
      message: "User registered successfully.",
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        createdAt: newUser.createdAt,
      },
    });

  } catch (err) {
    console.error("Signup error:", err.message);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = { signUpUser };
