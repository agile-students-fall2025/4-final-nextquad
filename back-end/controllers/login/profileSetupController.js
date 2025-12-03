const User = require("../../models/User");
const jwt = require("jsonwebtoken");

/**
 * Handles profile setup after registration.
 * POST /api/auth/profile-setup
 * Saves user profile to database.
 */
const setupProfile = async (req, res) => {
  const { email, firstName, lastName, nyuEmail, graduationYear, profileImage } = req.body;

  // Validate required fields
  if (!email || !firstName || !lastName || !nyuEmail || !graduationYear) {
    return res.status(400).json({
      success: false,
      error: "Email, first name, last name, NYU email, and graduation year are required.",
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
    // Find user by email and update profile
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found. Please sign up first.",
      });
    }

    // Update user profile
    user.firstName = firstName;
    user.lastName = lastName;
    user.nyuEmail = nyuEmail;
    user.graduationYear = gradYearNum;
    if (profileImage) {
      user.profileImage = profileImage;
    }
    
    await user.save();

    // Generate new JWT token with updated user info
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      },
      process.env.JWT_SECRET || "dev_jwt_secret",
      { expiresIn: "5d" }
    );

    console.log("✅ Profile setup successful for:", user.email);

    return res.status(200).json({
      success: true,
      message: "Profile setup successful.",
      token,
      data: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        nyuEmail: user.nyuEmail,
        graduationYear: user.graduationYear,
        profileImage: user.profileImage,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "Server error during profile setup.",
      message: err.message,
    });
  }
};

module.exports = { setupProfile };