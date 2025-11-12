const { findUserByEmail } = require("../../data/login/mockLogInData");

const signIn = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: "Email and password are required.",
    });
  }

  const user = findUserByEmail(email);
  console.log("User found during signIn:", user);
  
  if (!user || user.password !== password) {
    return res.status(401).json({
      success: false,
      error: "Invalid email or password.",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  });
};

module.exports = { signIn };