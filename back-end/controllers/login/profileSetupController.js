const User = require("../../models/User");
const jwt = require("jsonwebtoken");

/**
 * Handles profile setup after registration.
 * POST /api/auth/profile-setup
 * Saves user profile to database.
 */
const setupProfile = async (req, res) => {
  const { firstName, lastName, nyuEmail, graduationYear, profileImage } = req.body;

  // Validate required fields
  if (!firstName || !lastName || !nyuEmail || !graduationYear) {
    return res.status(400).json({
      success: false,
      error: "First name, last name, NYU email, and graduation year are required.",
    });
  }

  // Validate NYU email
  if (!nyuEmail.endsWith("@nyu.edu")) {
    return res.status(400).json({
      success: false,
      error: "Email must be an NYU email.",
    });
  }

  // Validate graduation year
  const gradYearNum = parseInt(graduationYear, 10);
  if (isNaN(gradYearNum) || gradYearNum <= 2024) {
    return res.status(400).json({
      success: false,
      error: "Graduation year must be greater than 2024.",
    });
  }

  try {
    // Get user ID from token
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: "No token provided.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev_jwt_secret");
    const userId = decoded.userId;

    // Update user in database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        firstName,
        lastName,
        nyuEmail,
        graduationYear: gradYearNum,
        profileImage: profileImage || null,
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: "User not found.",
      });
    }

    console.log("✅ Profile setup saved:", updatedUser.email);

    return res.status(200).json({
      success: true,
      message: "Profile setup successful.",
      data: {
        id: updatedUser._id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        nyuEmail: updatedUser.nyuEmail,
        graduationYear: updatedUser.graduationYear,
      },
    });
  } catch (err) {
    console.error("Profile setup error:", err.message);
    return res.status(500).json({
      success: false,
      error: "Server error.",
    });
  }
};

module.exports = { setupProfile };