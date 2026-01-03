import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import LeaveRequest from "../model/leaveRequest.model.js";
import LeaveType from "../model/leaveType.model.js";
import Employee from "../model/employee.model.js";

// ============= EMPLOYEE CONTROLLERS =============

// @desc    Apply for leave
// @route   POST /api/leave/apply
// @access  Private (Employee)
export const applyLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!leaveType || !startDate || !endDate || !reason) {
      throw new ApiError(400, "All fields are required");
    }

    // Find employee
    const employee = await Employee.findOne({ userId });
    if (!employee) {
      throw new ApiError(404, "Employee profile not found");
    }

    // Find leave type
    const leaveTypeDoc = await LeaveType.findOne({ 
      name: leaveType, 
      companyId: employee.companyId 
    });

    if (!leaveTypeDoc) {
      throw new ApiError(404, "Leave type not found");
    }

    // Calculate total days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    if (totalDays <= 0) {
      throw new ApiError(400, "End date must be after start date");
    }

    // Check if employee has enough leave balance
    const currentYear = new Date().getFullYear();
    const usedLeaves = await LeaveRequest.aggregate([
      {
        $match: {
          employeeId: employee._id,
          leaveTypeId: leaveTypeDoc._id,
          status: "APPROVED",
          startDate: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalDays" }
        }
      }
    ]);

    const usedDays = usedLeaves.length > 0 ? usedLeaves[0].total : 0;
    const remainingDays = leaveTypeDoc.maxDaysPerYear - usedDays;

    if (totalDays > remainingDays) {
      throw new ApiError(400, `Insufficient leave balance. Available: ${remainingDays} days`);
    }

    // Create leave request
    const leaveRequest = await LeaveRequest.create({
      employeeId: employee._id,
      companyId: employee.companyId,
      leaveTypeId: leaveTypeDoc._id,
      startDate,
      endDate,
      totalDays,
      reason,
      status: "PENDING"
    });

    const populatedLeave = await LeaveRequest.findById(leaveRequest._id)
      .populate('employeeId', 'firstName lastName employeeCode')
      .populate('leaveTypeId', 'name');

    res.status(201).json(
      new ApiResponse(201, populatedLeave, "Leave request submitted successfully")
    );
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message || "Error applying for leave");
  }
};

// @desc    Get my leave requests
// @route   GET /api/leave/my-leaves
// @access  Private (Employee)
export const getMyLeaveRequests = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, year } = req.query;

    // Find employee
    const employee = await Employee.findOne({ userId });
    if (!employee) {
      throw new ApiError(404, "Employee profile not found");
    }

    // Build query
    const query = { employeeId: employee._id };
    
    if (status) {
      query.status = status.toUpperCase();
    }

    if (year) {
      query.startDate = {
        $gte: new Date(`${year}-01-01`),
        $lte: new Date(`${year}-12-31`)
      };
    }

    const leaveRequests = await LeaveRequest.find(query)
      .populate('leaveTypeId', 'name maxDaysPerYear')
      .populate('approvedBy', 'email')
      .sort({ createdAt: -1 });

    res.status(200).json(
      new ApiResponse(200, leaveRequests, "Leave requests retrieved successfully")
    );
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message || "Error fetching leave requests");
  }
};

// @desc    Get my leave balance
// @route   GET /api/leave/my-balance
// @access  Private (Employee)
export const getMyLeaveBalance = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find employee
    const employee = await Employee.findOne({ userId });
    if (!employee) {
      throw new ApiError(404, "Employee profile not found");
    }

    // Get all leave types
    const leaveTypes = await LeaveType.find({ companyId: employee.companyId });

    // Calculate balance for each leave type
    const currentYear = new Date().getFullYear();
    const balances = await Promise.all(
      leaveTypes.map(async (leaveType) => {
        const usedLeaves = await LeaveRequest.aggregate([
          {
            $match: {
              employeeId: employee._id,
              leaveTypeId: leaveType._id,
              status: "APPROVED",
              startDate: {
                $gte: new Date(`${currentYear}-01-01`),
                $lte: new Date(`${currentYear}-12-31`)
              }
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$totalDays" }
            }
          }
        ]);

        const usedDays = usedLeaves.length > 0 ? usedLeaves[0].total : 0;

        return {
          leaveType: leaveType.name,
          totalAllowed: leaveType.maxDaysPerYear,
          used: usedDays,
          remaining: leaveType.maxDaysPerYear - usedDays
        };
      })
    );

    res.status(200).json(
      new ApiResponse(200, balances, "Leave balance retrieved successfully")
    );
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message || "Error fetching leave balance");
  }
};

// @desc    Cancel leave request
// @route   DELETE /api/leave/:id
// @access  Private (Employee)
export const cancelLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Find employee
    const employee = await Employee.findOne({ userId });
    if (!employee) {
      throw new ApiError(404, "Employee profile not found");
    }

    // Find leave request
    const leaveRequest = await LeaveRequest.findById(id);
    if (!leaveRequest) {
      throw new ApiError(404, "Leave request not found");
    }

    // Check if employee owns this leave request
    if (leaveRequest.employeeId.toString() !== employee._id.toString()) {
      throw new ApiError(403, "Unauthorized to cancel this leave request");
    }

    // Only pending requests can be cancelled
    if (leaveRequest.status !== "PENDING") {
      throw new ApiError(400, "Only pending leave requests can be cancelled");
    }

    await LeaveRequest.findByIdAndDelete(id);

    res.status(200).json(
      new ApiResponse(200, null, "Leave request cancelled successfully")
    );
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message || "Error cancelling leave request");
  }
};

// ============= ADMIN CONTROLLERS =============

// @desc    Get all leave requests
// @route   GET /api/leave/all
// @access  Private (Admin/HR)
export const getAllLeaveRequests = async (req, res) => {
  try {
    const { status, employeeId, startDate, endDate, page = 1, limit = 50 } = req.query;

    // Check admin role
    const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'HR';
    if (!isAdmin) {
      throw new ApiError(403, "Access denied. Admin or HR role required");
    }

    // Build query
    const query = {};
    
    if (status) {
      query.status = status.toUpperCase();
    }

    if (employeeId) {
      query.employeeId = employeeId;
    }

    if (startDate || endDate) {
      query.startDate = {};
      if (startDate) query.startDate.$gte = new Date(startDate);
      if (endDate) query.startDate.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [leaveRequests, total] = await Promise.all([
      LeaveRequest.find(query)
        .populate('employeeId', 'firstName lastName employeeCode department')
        .populate('leaveTypeId', 'name maxDaysPerYear')
        .populate('approvedBy', 'email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      LeaveRequest.countDocuments(query)
    ]);

    res.status(200).json(
      new ApiResponse(200, {
        leaveRequests,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit))
        }
      }, "Leave requests retrieved successfully")
    );
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message || "Error fetching leave requests");
  }
};

// @desc    Approve or reject leave request
// @route   PUT /api/leave/:id/status
// @access  Private (Admin/HR)
export const updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comments } = req.body;
    const userId = req.user._id;

    // Check admin role
    const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'HR';
    if (!isAdmin) {
      throw new ApiError(403, "Access denied. Admin or HR role required");
    }

    // Validate status
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      throw new ApiError(400, "Invalid status. Must be APPROVED or REJECTED");
    }

    // Find leave request
    const leaveRequest = await LeaveRequest.findById(id);
    if (!leaveRequest) {
      throw new ApiError(404, "Leave request not found");
    }

    // Check if already processed
    if (leaveRequest.status !== "PENDING") {
      throw new ApiError(400, "This leave request has already been processed");
    }

    // Update leave request
    leaveRequest.status = status;
    leaveRequest.approvedBy = userId;
    leaveRequest.approvedAt = new Date();
    if (comments) {
      leaveRequest.comments = comments;
    }

    await leaveRequest.save();

    const updatedLeave = await LeaveRequest.findById(id)
      .populate('employeeId', 'firstName lastName employeeCode')
      .populate('leaveTypeId', 'name')
      .populate('approvedBy', 'email');

    res.status(200).json(
      new ApiResponse(200, updatedLeave, `Leave request ${status.toLowerCase()} successfully`)
    );
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message || "Error updating leave status");
  }
};

// @desc    Get leave statistics
// @route   GET /api/leave/statistics
// @access  Private (Admin/HR)
export const getLeaveStatistics = async (req, res) => {
  try {
    // Check admin role
    const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'HR';
    if (!isAdmin) {
      throw new ApiError(403, "Access denied. Admin or HR role required");
    }

    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(`${currentYear}-01-01`);
    const endOfYear = new Date(`${currentYear}-12-31`);

    // Get statistics
    const [totalRequests, pendingRequests, approvedRequests, rejectedRequests, leavesByType] = await Promise.all([
      LeaveRequest.countDocuments({ startDate: { $gte: startOfYear, $lte: endOfYear } }),
      LeaveRequest.countDocuments({ status: 'PENDING', startDate: { $gte: startOfYear, $lte: endOfYear } }),
      LeaveRequest.countDocuments({ status: 'APPROVED', startDate: { $gte: startOfYear, $lte: endOfYear } }),
      LeaveRequest.countDocuments({ status: 'REJECTED', startDate: { $gte: startOfYear, $lte: endOfYear } }),
      LeaveRequest.aggregate([
        {
          $match: {
            startDate: { $gte: startOfYear, $lte: endOfYear }
          }
        },
        {
          $group: {
            _id: '$leaveTypeId',
            count: { $sum: 1 },
            totalDays: { $sum: '$totalDays' }
          }
        },
        {
          $lookup: {
            from: 'leavetypes',
            localField: '_id',
            foreignField: '_id',
            as: 'leaveType'
          }
        },
        {
          $unwind: '$leaveType'
        },
        {
          $project: {
            leaveType: '$leaveType.name',
            count: 1,
            totalDays: 1
          }
        }
      ])
    ]);

    const statistics = {
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      leavesByType
    };

    res.status(200).json(
      new ApiResponse(200, statistics, "Leave statistics retrieved successfully")
    );
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message || "Error fetching leave statistics");
  }
};

// @desc    Get leave types
// @route   GET /api/leave/types
// @access  Private
export const getLeaveTypes = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find employee to get companyId
    const employee = await Employee.findOne({ userId });
    if (!employee) {
      throw new ApiError(404, "Employee profile not found");
    }

    const leaveTypes = await LeaveType.find({ companyId: employee.companyId });

    res.status(200).json(
      new ApiResponse(200, leaveTypes, "Leave types retrieved successfully")
    );
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message || "Error fetching leave types");
  }
};

// @desc    Create leave type (Admin only)
// @route   POST /api/leave/types
// @access  Private (Admin)
export const createLeaveType = async (req, res) => {
  try {
    const { name, maxDaysPerYear } = req.body;
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

    // Check if leave type already exists
    const existingLeaveType = await LeaveType.findOne({ 
      name, 
      companyId: employee.companyId 
    });

    if (existingLeaveType) {
      throw new ApiError(400, "Leave type already exists");
    }

    const leaveType = await LeaveType.create({
      companyId: employee.companyId,
      name,
      maxDaysPerYear
    });

    res.status(201).json(
      new ApiResponse(201, leaveType, "Leave type created successfully")
    );
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message || "Error creating leave type");
  }
};
