import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import User from "../model/user.model.js";
import Employee from "../model/employee.model.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../config/cloudinary.js";

// @desc    Get employee profile
// @route   GET /api/profile/:employeeId
// @access  Private
export const getProfile = asyncHandler(async (req, res) => {
  const { employeeId } = req.params;
  const userId = req.user._id;

  // Find employee with user details
  const employee = await Employee.findById(employeeId).populate('userId', '-password');

  if (!employee) {
    throw new ApiError(404, "Employee not found");
  }

  // Check if user has permission to view this profile
  const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'HR';
  const isOwnProfile = employee.userId._id.toString() === userId.toString();

  if (!isAdmin && !isOwnProfile) {
    throw new ApiError(403, "You don't have permission to view this profile");
  }

  res.status(200).json(
    new ApiResponse(200, employee, "Profile retrieved successfully")
  );
});

// @desc    Get current user profile
// @route   GET /api/profile/me
// @access  Private
export const getMyProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const employee = await Employee.findOne({ userId }).populate('userId', '-password');

  if (!employee) {
    throw new ApiError(404, "Employee profile not found");
  }

  res.status(200).json(
    new ApiResponse(200, employee, "Profile retrieved successfully")
  );
});

// @desc    Update employee profile
// @route   PUT /api/profile/:employeeId
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const { employeeId } = req.params;
  const userId = req.user._id;
  const {
    firstName,
    lastName,
    phone,
    address,
    city,
    state,
    zipCode,
    country,
    dateOfBirth,
    gender,
    emergencyContactName,
    emergencyContactPhone,
    // Admin-only fields
    department,
    designation,
    joiningDate,
    employmentType,
    workLocation,
    reportingTo,
    basicSalary,
    allowances,
    deductions,
  } = req.body;

  const employee = await Employee.findById(employeeId);

  if (!employee) {
    throw new ApiError(404, "Employee not found");
  }

  const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'HR';
  const isOwnProfile = employee.userId.toString() === userId.toString();

  if (!isAdmin && !isOwnProfile) {
    throw new ApiError(403, "You don't have permission to update this profile");
  }

  // Fields that employees can update
  const employeeEditableFields = {
    phone,
    address,
    city,
    state,
    zipCode,
    country,
    emergencyContactName,
    emergencyContactPhone,
  };

  // Fields that only admin can update
  const adminOnlyFields = {
    department,
    designation,
    joiningDate,
    employmentType,
    workLocation,
    reportingTo,
    basicSalary,
    allowances,
    deductions,
  };

  // Update based on role
  if (isAdmin) {
    // Admin can update everything
    Object.keys({ ...employeeEditableFields, ...adminOnlyFields, firstName, lastName, dateOfBirth, gender }).forEach(key => {
      if (req.body[key] !== undefined) {
        employee[key] = req.body[key];
      }
    });
  } else {
    // Employee can only update limited fields
    Object.keys(employeeEditableFields).forEach(key => {
      if (employeeEditableFields[key] !== undefined) {
        employee[key] = employeeEditableFields[key];
      }
    });
  }

  await employee.save();

  const updatedEmployee = await Employee.findById(employeeId).populate('userId', '-password');

  res.status(200).json(
    new ApiResponse(200, updatedEmployee, "Profile updated successfully")
  );
});

// @desc    Upload profile picture
// @route   POST /api/profile/:employeeId/upload-picture
// @access  Private
export const uploadProfilePicture = asyncHandler(async (req, res) => {
  const { employeeId } = req.params;
  const userId = req.user._id;

  if (!req.file) {
    throw new ApiError(400, "Please upload an image file");
  }

  const employee = await Employee.findById(employeeId);

  if (!employee) {
    throw new ApiError(404, "Employee not found");
  }

  const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'HR';
  const isOwnProfile = employee.userId.toString() === userId.toString();

  if (!isAdmin && !isOwnProfile) {
    throw new ApiError(403, "You don't have permission to update this profile picture");
  }

  // Delete old profile picture from Cloudinary if exists
  if (employee.profileImagePublicId) {
    try {
      await deleteFromCloudinary(employee.profileImagePublicId);
    } catch (error) {
      console.error("Error deleting old profile picture:", error);
    }
  }

  // Upload new picture to Cloudinary
  const uploadResult = await uploadToCloudinary(req.file.buffer, 'employee-profiles');

  employee.profileImage = uploadResult.url;
  employee.profileImagePublicId = uploadResult.publicId;

  await employee.save();

  const updatedEmployee = await Employee.findById(employeeId).populate('userId', '-password');

  res.status(200).json(
    new ApiResponse(200, updatedEmployee, "Profile picture uploaded successfully")
  );
});

// @desc    Upload document
// @route   POST /api/profile/:employeeId/upload-document
// @access  Private
export const uploadDocument = asyncHandler(async (req, res) => {
  const { employeeId } = req.params;
  const { type } = req.body; // Get type from body
  const userId = req.user._id;

  if (!req.file) {
    throw new ApiError(400, "Please upload a document file");
  }

  if (!type) {
    throw new ApiError(400, "Please provide document type");
  }

  const employee = await Employee.findById(employeeId);

  if (!employee) {
    throw new ApiError(404, "Employee not found");
  }

  const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'HR';
  const isOwnProfile = employee.userId.toString() === userId.toString();

  if (!isAdmin && !isOwnProfile) {
    throw new ApiError(403, "You don't have permission to upload documents");
  }

  // Upload document to Cloudinary
  const uploadResult = await uploadToCloudinary(req.file.buffer, 'employee-documents');

  // Add document to employee's documents array
  if (!employee.documents) {
    employee.documents = [];
  }

  employee.documents.push({
    type: type,
    name: req.file.originalname,
    url: uploadResult.url,
    publicId: uploadResult.publicId,
    uploadedAt: new Date(),
  });

  await employee.save();

  const updatedEmployee = await Employee.findById(employeeId).populate('userId', '-password');

  res.status(200).json(
    new ApiResponse(200, updatedEmployee, "Document uploaded successfully")
  );
});

// @desc    Delete document
// @route   DELETE /api/profile/:employeeId/document/:documentId
// @access  Private
export const deleteDocument = asyncHandler(async (req, res) => {
  const { employeeId, documentId } = req.params;
  const userId = req.user._id;

  const employee = await Employee.findById(employeeId);

  if (!employee) {
    throw new ApiError(404, "Employee not found");
  }

  const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'HR';
  const isOwnProfile = employee.userId.toString() === userId.toString();

  if (!isAdmin && !isOwnProfile) {
    throw new ApiError(403, "You don't have permission to delete documents");
  }

  const document = employee.documents.id(documentId);

  if (!document) {
    throw new ApiError(404, "Document not found");
  }

  // Delete from Cloudinary
  if (document.publicId) {
    try {
      await deleteFromCloudinary(document.publicId);
    } catch (error) {
      console.error("Error deleting document from Cloudinary:", error);
    }
  }

  // Remove document from array
  employee.documents.pull(documentId);
  await employee.save();

  const updatedEmployee = await Employee.findById(employeeId).populate('userId', '-password');

  res.status(200).json(
    new ApiResponse(200, updatedEmployee, "Document deleted successfully")
  );
});

// @desc    Get all employees (Admin only)
// @route   GET /api/profile/all
// @access  Private (Admin/HR)
export const getAllEmployees = asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'HR';

  if (!isAdmin) {
    throw new ApiError(403, "Access denied. Admin or HR role required.");
  }

  const employees = await Employee.find().populate('userId', '-password').sort({ createdAt: -1 });

  res.status(200).json(
    new ApiResponse(200, employees, "Employees retrieved successfully")
  );
});
