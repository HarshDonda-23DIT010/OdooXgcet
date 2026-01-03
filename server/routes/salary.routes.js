import express from 'express';
import {
  // Employee routes
  getMySalary,
  getMySalaryHistory,
  
  // Admin routes
  getAllEmployeesSalary,
  updateEmployeeSalary,
  getSalaryStatistics
} from '../controllers/salary.controller.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Employee routes
router.get('/my-salary', isAuthenticated, getMySalary);
router.get('/my-history', isAuthenticated, getMySalaryHistory);

// Admin routes
router.get('/all', isAuthenticated, getAllEmployeesSalary);
router.put('/:employeeId', isAuthenticated, updateEmployeeSalary);
router.get('/statistics', isAuthenticated, getSalaryStatistics);

export default router;
