import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import User from "../model/user.model.js";

// Middleware to verify JWT token and authenticate user
export const isAuthenticated = asyncHandler(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    throw new ApiError(401, "Please log in to access this resource");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    
    const user = await User.findById(decoded.id).select("-password");
    
    if (!user) {
      throw new ApiError(401, "User not found. Please log in again");
    }

    if (!user.isActive) {
      throw new ApiError(403, "Your account has been deactivated");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      throw new ApiError(401, "Invalid token. Please log in again");
    }
    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Token expired. Please log in again");
    }
    throw error;
  }
});

// Middleware to authorize based on roles
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ApiError(
        403,
        `Role '${req.user.role}' is not authorized to access this resource`
      );
    }
    next();
  };
};

// Middleware to check if email is verified
export const isEmailVerified = asyncHandler(async (req, res, next) => {
  if (!req.user.isEmailVerified) {
    throw new ApiError(403, "Please verify your email to access this resource");
  }
  next();
});
