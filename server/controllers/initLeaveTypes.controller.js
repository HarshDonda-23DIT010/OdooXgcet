import LeaveType from "../model/leaveType.model.js";
import Employee from "../model/employee.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";

// @desc    Initialize default leave types for company
// @route   POST /api/leave/init-types
// @access  Private (Admin only)
export const initializeLeaveTypes = async (req, res) => {
  try {
    const userId = req.user._id;

    // Check admin role
    const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'HR';
    if (!isAdmin) {
      throw new ApiError(403, "Access denied. Admin role required");
    }

    // Find employee to get companyId
    const employee = await Employee.findOne({ userId });
    if (!employee) {
      throw new ApiError(404, "Employee profile not found");
    }

    const companyId = employee.companyId;

    // Check if leave types already exist
    const existingTypes = await LeaveType.find({ companyId });
    if (existingTypes.length > 0) {
      return res.status(200).json(
        new ApiResponse(200, existingTypes, "Leave types already initialized")
      );
    }

    // Define the three standard leave types
    const defaultLeaveTypes = [
      {
        companyId,
        name: "Casual Leave",
        maxDaysPerYear: 8
      },
      {
        companyId,
        name: "Annual Leave",
        maxDaysPerYear: 15
      },
      {
        companyId,
        name: "Emergency Leave",
        maxDaysPerYear: 3
      }
    ];

    // Create leave types
    const createdLeaveTypes = await LeaveType.insertMany(defaultLeaveTypes);

    res.status(201).json(
      new ApiResponse(201, createdLeaveTypes, "Leave types initialized successfully")
    );
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message || "Error initializing leave types");
  }
};
