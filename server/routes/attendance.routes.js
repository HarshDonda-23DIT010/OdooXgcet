import express from 'express';
import {
  checkIn,
  checkOut,
  getMyAttendance,
  getTodayAttendance,
  getAllAttendance,
  getAttendanceSummary,
  updateAttendance,
  deleteAttendance,
  exportAttendanceToExcel,
  exportEmployeesToExcel,
} from '../controllers/attendance.controller.js';
import { isAuthenticated, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(isAuthenticated);

// Employee routes
router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.get('/my-attendance', getMyAttendance);
router.get('/today', getTodayAttendance);

// Admin/HR routes
router.get('/all', authorizeRoles('ADMIN', 'HR'), getAllAttendance);
router.get('/summary', authorizeRoles('ADMIN', 'HR'), getAttendanceSummary);
router.get('/export/excel', authorizeRoles('ADMIN', 'HR'), exportAttendanceToExcel);
router.get('/export/employees', authorizeRoles('ADMIN', 'HR'), exportEmployeesToExcel);
router.put('/:attendanceId', authorizeRoles('ADMIN', 'HR'), updateAttendance);
router.delete('/:attendanceId', authorizeRoles('ADMIN', 'HR'), deleteAttendance);

export default router;
