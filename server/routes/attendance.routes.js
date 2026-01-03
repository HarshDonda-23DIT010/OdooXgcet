import express from "express";
import {
  checkIn,
  checkOut,
  getTodayAttendance,
  getMyAttendance,
  getAllAttendance,
  getAttendanceSummary,
  exportAttendanceToExcel,
  exportEmployeesToExcel,
  markAttendanceForEmployee,
  updateAttendance,
  deleteAttendance,
} from "../controllers/attendance.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();


// Employee routes - all require authentication
router.post("/check-in", verifyToken, checkIn);
router.post("/check-out", verifyToken, checkOut);
router.get("/today", verifyToken, getTodayAttendance);
router.get("/my-attendance", verifyToken, getMyAttendance);

// Admin routes - require authentication and admin role
router.get("/all", verifyToken, getAllAttendance);
router.get("/summary", verifyToken, getAttendanceSummary);
router.get("/export/excel", verifyToken, exportAttendanceToExcel);
router.get("/export/employees", verifyToken, exportEmployeesToExcel);
router.post("/mark", verifyToken, markAttendanceForEmployee);
router.put("/:id", verifyToken, updateAttendance);
router.delete("/:id", verifyToken, deleteAttendance);

export default router;
