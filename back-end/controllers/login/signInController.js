const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../../models/User");

const signIn = async (req, res) => {
  const { email, password } = req.body;

  // Step 1: Validate presence
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required.",
    });
  }

  try {
    // Step 2: Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Email not found.",
      });
    }

    // Step 2.1: Prevent login if user is banned
    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: "Your account has been banned. Please contact support.",
      });
    }

    // Debug Logs
    console.log("INPUT:", email, password);
    console.log("USER FOUND:", user.email, user.password);

    // Step 3: Compare hashed password using bcrypt
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password.",
      });
    }

    // Step 4: Create JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      process.env.JWT_SECRET || "dev_jwt_secret",
      { expiresIn: "5d" }
    );

    // Step 5: Return success
    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        nyuEmail: user.nyuEmail,
        graduationYear: user.graduationYear,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error.",
      error: err.message,
    });
  }
};

module.exports = { signIn };
