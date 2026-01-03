import express from 'express';
import {
  getProfile,
  getMyProfile,
  updateProfile,
  uploadProfilePicture,
  uploadDocument as uploadDocumentController,
  deleteDocument,
  getAllEmployees,
} from '../controllers/profile.controller.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';
import { uploadImage, uploadDocument } from '../middleware/upload.js';

const router = express.Router();

// All routes require authentication
router.use(isAuthenticated);

// Get my profile
router.get('/me', getMyProfile);

// Get all employees (admin only)
router.get('/all', getAllEmployees);

// Get specific employee profile
router.get('/:employeeId', getProfile);

// Update employee profile
router.put('/:employeeId', updateProfile);

// Upload profile picture
router.post('/:employeeId/upload-picture', uploadImage.single('image'), uploadProfilePicture);

// Upload document
router.post('/:employeeId/upload-document', uploadDocument.single('document'), uploadDocumentController);

// Delete document
router.delete('/:employeeId/document/:documentId', deleteDocument);

export default router;