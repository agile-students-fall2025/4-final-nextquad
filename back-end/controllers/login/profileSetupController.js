/**
 * Handles profile setup after registration.
 * POST /api/auth/profile-setup
 * Simulates saving a new user profile.
 */
const setupProfile = (req, res) => {
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

  // Simulate saving to database
  const userProfile = {
    id: Date.now(),
    firstName,
    lastName,
    nyuEmail,
    graduationYear: gradYearNum,
    profileImage: profileImage || null, 
  };

  console.log("✅ Profile setup received:", userProfile);

  return res.status(201).json({
    success: true,
    message: "Profile setup successful.",
    data: userProfile,
  });
};

module.exports = { setupProfile };