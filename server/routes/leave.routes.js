import express from 'express';
import {
  // Employee routes
  applyLeave,
  getMyLeaveRequests,
  getMyLeaveBalance,
  cancelLeaveRequest,
  
  // Admin routes
  getAllLeaveRequests,
  updateLeaveStatus,
  getLeaveStatistics,
  
  // Common routes
  getLeaveTypes,
  createLeaveType
} from '../controllers/leave.controller.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Employee routes
router.post('/apply', isAuthenticated, applyLeave);
router.get('/my-leaves', isAuthenticated, getMyLeaveRequests);
router.get('/my-balance', isAuthenticated, getMyLeaveBalance);
router.delete('/:id', isAuthenticated, cancelLeaveRequest);

// Admin routes
router.get('/all', isAuthenticated, getAllLeaveRequests);
router.put('/:id/status', isAuthenticated, updateLeaveStatus);
router.get('/statistics', isAuthenticated, getLeaveStatistics);

// Common routes
router.get('/types', isAuthenticated, getLeaveTypes);
router.post('/types', isAuthenticated, createLeaveType);

export default router;
