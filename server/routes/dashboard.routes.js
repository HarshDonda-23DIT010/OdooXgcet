import express from "express";
import {
  getEmployeeDashboardStats,
  getAdminDashboardStats
} from "../controllers/dashboard.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Employee dashboard statistics
router.get("/employee-stats", verifyToken, getEmployeeDashboardStats);

// Admin dashboard statistics
router.get("/admin-stats", verifyToken, getAdminDashboardStats);

export default router;
