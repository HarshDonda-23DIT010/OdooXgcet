import jwt from "jsonwebtoken";
import User from "../model/user.model.js";

export const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Please log in to access this resource",
        errors: [],
      });
    }



    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found. Please log in again",
        errors: [],
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated",
        errors: [],
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Please log in again",
        errors: [],
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please log in again",
        errors: [],
      });
    }

    return res.status(500).json({
      success: false,
      message: "Authentication failed",
      errors: [],
    });
  }
};

/**
 * ===============================
 * ROLE AUTHORIZATION MIDDLEWARE
 * ===============================
 * Usage: authorizeRoles("ADMIN", "HR")
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user?.role}' is not authorized to access this resource`,
        errors: [],
      });
    }
    next();
  };
};

/**
 * ===============================
 * EMAIL VERIFICATION MIDDLEWARE
 * ===============================
 */
export const isEmailVerified = (req, res, next) => {
  if (!req.user?.isEmailVerified) {
    return res.status(403).json({
      success: false,
      message: "Please verify your email to access this resource",
      errors: [],
    });
  }
  next();
};

/**
 * ===============================
 * VERIFY TOKEN (ALIAS FOR isAuthenticated)
 * ===============================
 */
export const verifyToken = isAuthenticated;