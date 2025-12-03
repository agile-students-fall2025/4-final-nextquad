const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  // Expect header: Authorization: Bearer <token>
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No token provided."
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "dev_jwt_secret"
    );

    // Attach user info to request
    req.user = decoded;

    next(); // proceed to protected route
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: "Invalid or expired token."
    });
  }
};

module.exports = authenticateToken;