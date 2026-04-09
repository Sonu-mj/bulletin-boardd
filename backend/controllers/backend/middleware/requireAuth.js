const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

function requireAuth(req, res, next) {
  if (!JWT_SECRET) {
    console.error("[requireAuth] JWT_SECRET is not set.");
    return res.status(500).json({ success: false, message: "Server misconfiguration." });
  }

  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authentication required. Please log in.",
    });
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Your session has expired. Please log in again.",
        code: "TOKEN_EXPIRED",
      });
    }
    return res.status(401).json({
      success: false,
      message: "Invalid token. Please log in again.",
      code: "TOKEN_INVALID",
    });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required.",
    });
  }
  return next();
}

module.exports = { requireAuth, requireAdmin };
