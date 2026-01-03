import express from "express";
import {
  signup,
  signin,
  logout,
  verifyEmail,
  getCurrentUser,
  resendVerificationEmail,
} from "../controllers/auth.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes
router.post("/signup", signup);
router.post("/signin", signin);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerificationEmail);

// Protected routes
router.post("/logout", isAuthenticated, logout);
router.get("/me", isAuthenticated, getCurrentUser);

export default router;
