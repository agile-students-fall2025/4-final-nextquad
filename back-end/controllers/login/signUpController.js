const { findUserByEmail, createMockUser } = require("../../data/login/mockLogInData");

const signUpUser = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required.",
    });
  }

  if (findUserByEmail(email)) {
    return res.status(409).json({
      success: false,
      message: "Email already registered.",
    });
  }

  const newUser = createMockUser(email, password);

  return res.status(201).json({
    success: true,
    message: "User created successfully",
    data: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      createdAt: newUser.createdAt,
    },
  });
};

module.exports = { signUpUser };