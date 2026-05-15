const jwt = require("jsonwebtoken");

const {findUserById} = require("../repositories/user.repository");

async function userMiddleware(req, res, next) {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        message: "Not authorized - No token provided",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Fetch user from PostgreSQL
    const user = await findUserById(decoded.id);

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    // Check verification
    if (!user.is_verified) {
      return res.status(403).json({
        message: "Email not verified",
      });
    }

    // Attach minimal user info
    req.user = {
      id: user.id,
      role: user.role,
    };

    next();

  } catch (error) {

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        message: "Invalid token",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token expired",
      });
    }

    console.error("Auth middleware error:", error);

    res.status(401).json({
      message: "Authentication failed",
    });
  }
}

async function adminMiddleware(req, res, next) {
  try {

    if (!req.user) {
      return res.status(401).json({
        message: "Not authorized - User context missing",
      });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Access denied - Admin privileges required",
      });
    }

    next();

  } catch (error) {

    console.error("Admin middleware error:", error);

    res.status(500).json({
      message: "Server error in admin authorization",
    });
  }
}

module.exports = {
  userMiddleware,
  adminMiddleware,
};