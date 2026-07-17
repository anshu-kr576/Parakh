const jwt = require("jsonwebtoken");

/**
 * JWT Authentication Middleware.
 *
 * Extracts and verifies the Bearer token from the Authorization header.
 * On success, attaches the decoded user payload to `req.user`.
 * On failure, responds with 401 Unauthorized.
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      error: "Access denied. No authentication token provided.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: "Authentication token has expired. Please sign in again.",
      });
    }
    return res.status(401).json({
      success: false,
      error: "Invalid authentication token.",
    });
  }
};

module.exports = authMiddleware;
