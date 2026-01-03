import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import Attendance from "../model/attendance.model.js";
import Employee from "../model/employee.model.js";
import User from "../model/user.model.js";
import XLSX from 'xlsx';

// @desc    Mark attendance (Check-in)
// @route   POST /api/attendance/check-in
// @access  Private
export const checkIn = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { notes } = req.body;

  // Get employee profile
  const employee = await Employee.findOne({ userId });
  if (!employee) {
    throw new ApiError(404, "Employee profile not found");
  }

  // Check if already checked in today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const existingAttendance = await Attendance.findOne({
    employeeId: employee._id,
    date: { $gte: today }
  });

  if (existingAttendance && existingAttendance.checkIn) {
    throw new ApiError(400, "You have already checked in today");
  }

  // Create or update attendance
  let attendance;
  if (existingAttendance) {
    existingAttendance.checkIn = new Date();
    existingAttendance.status = "Present";
    existingAttendance.notes = notes;
    attendance = await existingAttendance.save();
  } else {
    attendance = await Attendance.create({
      employeeId: employee._id,
      userId: userId,
      companyId: employee.companyId,
      date: today,
      checkIn: new Date(),
      status: "Present",
      notes: notes
    });
  }

  const populatedAttendance = await Attendance.findById(attendance._id)
    .populate('employeeId', 'firstName lastName employeeCode')
    .populate('userId', 'email');

  res.status(200).json(
    new ApiResponse(200, populatedAttendance, "Checked in successfully")
  );
});

// @desc    Mark attendance (Check-out)
// @route   POST /api/attendance/check-out
// @access  Private
export const checkOut = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { notes } = req.body;

  // Get employee profile
  const employee = await Employee.findOne({ userId });
  if (!employee) {
    throw new ApiError(404, "Employee profile not found");
  }

  // Find today's attendance
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const attendance = await Attendance.findOne({
    employeeId: employee._id,
    date: { $gte: today }
  });

  if (!attendance) {
    throw new ApiError(404, "No check-in record found for today");
  }

  if (!attendance.checkIn) {
    throw new ApiError(400, "Please check in first");
  }

  if (attendance.checkOut) {
    throw new ApiError(400, "You have already checked out today");
  }

  // Update check-out time
  attendance.checkOut = new Date();
  if (notes) {
    attendance.notes = notes;
  }
  
  await attendance.save();

  const populatedAttendance = await Attendance.findById(attendance._id)
    .populate('employeeId', 'firstName lastName employeeCode')
    .populate('userId', 'email');

  res.status(200).json(
    new ApiResponse(200, populatedAttendance, "Checked out successfully")
  );
});

// @desc    Get my attendance records
// @route   GET /api/attendance/my-attendance
// @access  Private
export const getMyAttendance = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { startDate, endDate, page = 1, limit = 10 } = req.query;

  // Get employee profile
  const employee = await Employee.findOne({ userId });
  if (!employee) {
    throw new ApiError(404, "Employee profile not found");
  }

  // Build query
  const query = { employeeId: employee._id };

  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  // Pagination
  const skip = (page - 1) * limit;

  const attendance = await Attendance.find(query)
    .populate('employeeId', 'firstName lastName employeeCode department')
    .sort({ date: -1 })
    .limit(Number(limit))
    .skip(skip);

  const total = await Attendance.countDocuments(query);

  res.status(200).json(
    new ApiResponse(200, {
      attendance,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
        hasMore: skip + attendance.length < total
      }
    }, "Attendance records retrieved successfully")
  );
});

// @desc    Get today's attendance status
// @route   GET /api/attendance/today
// @access  Private
export const getTodayAttendance = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Get employee profile
  const employee = await Employee.findOne({ userId });
  if (!employee) {
    throw new ApiError(404, "Employee profile not found");
  }

  // Find today's attendance
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const attendance = await Attendance.findOne({
    employeeId: employee._id,
    date: { $gte: today }
  }).populate('employeeId', 'firstName lastName employeeCode');

  res.status(200).json(
    new ApiResponse(200, attendance, "Today's attendance retrieved successfully")
  );
});

// @desc    Get all attendance records (Admin only)
// @route   GET /api/attendance/all
// @access  Private (Admin/HR)
export const getAllAttendance = asyncHandler(async (req, res) => {
  const { startDate, endDate, status, employeeId, page = 1, limit = 20 } = req.query;

  // Build query
  const query = {};

  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  if (status) {
    query.status = status;
  }

  if (employeeId) {
    query.employeeId = employeeId;
  }

  // Pagination
  const skip = (page - 1) * limit;

  const attendance = await Attendance.find(query)
    .populate('employeeId', 'firstName lastName employeeCode department designation')
    .populate('userId', 'email')
    .sort({ date: -1 })
    .limit(Number(limit))
    .skip(skip);

  const total = await Attendance.countDocuments(query);

  res.status(200).json(
    new ApiResponse(200, {
      attendance,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
        hasMore: skip + attendance.length < total
      }
    }, "All attendance records retrieved successfully")
  );
});

// @desc    Get attendance summary (Admin only)
// @route   GET /api/attendance/summary
// @access  Private (Admin/HR)
export const getAttendanceSummary = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Query for date range or default to today
  const query = {
    date: {
      $gte: startDate ? new Date(startDate) : today,
      $lte: endDate ? new Date(endDate) : today
    }
  };

  // Get counts by status
  const summary = await Attendance.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // Format summary
  const formattedSummary = {
    Present: 0,
    Absent: 0,
    'Half-day': 0,
    Leave: 0,
    total: 0
  };

  summary.forEach(item => {
    formattedSummary[item._id] = item.count;
    formattedSummary.total += item.count;
  });

  res.status(200).json(
    new ApiResponse(200, formattedSummary, "Attendance summary retrieved successfully")
  );
});

// @desc    Update attendance status (Admin only)
// @route   PUT /api/attendance/:attendanceId
// @access  Private (Admin/HR)
export const updateAttendance = asyncHandler(async (req, res) => {
  const { attendanceId } = req.params;
  const { status, notes, checkIn, checkOut } = req.body;

  const attendance = await Attendance.findById(attendanceId);

  if (!attendance) {
    throw new ApiError(404, "Attendance record not found");
  }

  if (status) attendance.status = status;
  if (notes) attendance.notes = notes;
  if (checkIn) attendance.checkIn = new Date(checkIn);
  if (checkOut) attendance.checkOut = new Date(checkOut);

  await attendance.save();

  const updatedAttendance = await Attendance.findById(attendanceId)
    .populate('employeeId', 'firstName lastName employeeCode department')
    .populate('userId', 'email');

  res.status(200).json(
    new ApiResponse(200, updatedAttendance, "Attendance updated successfully")
  );
});

// @desc    Delete attendance record (Admin only)
// @route   DELETE /api/attendance/:attendanceId
// @access  Private (Admin/HR)
export const deleteAttendance = asyncHandler(async (req, res) => {
  const { attendanceId } = req.params;

  const attendance = await Attendance.findById(attendanceId);

  if (!attendance) {
    throw new ApiError(404, "Attendance record not found");
  }

  await attendance.deleteOne();

  res.status(200).json(
    new ApiResponse(200, null, "Attendance record deleted successfully")
  );
});

// @desc    Export attendance to Excel (Admin only)
// @route   GET /api/attendance/export/excel
// @access  Private (Admin/HR)
export const exportAttendanceToExcel = asyncHandler(async (req, res) => {
  const { startDate, endDate, status, employeeId } = req.query;

  // Build query
  const query = {};

  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  if (status) {
    query.status = status;
  }

  if (employeeId) {
    query.employeeId = employeeId;
  }

  // Fetch all attendance records
  const attendance = await Attendance.find(query)
    .populate('employeeId', 'firstName lastName employeeCode department designation')
    .populate('userId', 'email')
    .sort({ date: -1 });

  // Prepare data for Excel
  const excelData = attendance.map(record => ({
    'Employee Code': record.employeeId?.employeeCode || 'N/A',
    'Employee Name': `${record.employeeId?.firstName || ''} ${record.employeeId?.lastName || ''}`,
    'Department': record.employeeId?.department || 'N/A',
    'Designation': record.employeeId?.designation || 'N/A',
    'Email': record.userId?.email || 'N/A',
    'Date': new Date(record.date).toLocaleDateString(),
    'Check In': record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : 'N/A',
    'Check Out': record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : 'N/A',
    'Working Hours': record.workingHours || 0,
    'Status': record.status,
    'Notes': record.notes || ''
  }));

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 15 }, // Employee Code
    { wch: 25 }, // Employee Name
    { wch: 20 }, // Department
    { wch: 20 }, // Designation
    { wch: 30 }, // Email
    { wch: 15 }, // Date
    { wch: 15 }, // Check In
    { wch: 15 }, // Check Out
    { wch: 15 }, // Working Hours
    { wch: 12 }, // Status
    { wch: 30 }, // Notes
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');

  // Generate buffer
  const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  // Set headers for file download
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=attendance_${Date.now()}.xlsx`);

  res.send(excelBuffer);
});

// @desc    Export employees to Excel (Admin only)
// @route   GET /api/attendance/export/employees
// @access  Private (Admin/HR)
export const exportEmployeesToExcel = asyncHandler(async (req, res) => {
  // Fetch all employees with user data
  const employees = await Employee.find()
    .populate('userId', 'email role isActive')
    .sort({ employeeCode: 1 });

  // Prepare data for Excel
  const excelData = employees.map(emp => ({
    'Employee Code': emp.employeeCode || 'N/A',
    'First Name': emp.firstName || 'N/A',
    'Last Name': emp.lastName || 'N/A',
    'Email': emp.userId?.email || 'N/A',
    'Phone': emp.phone || 'N/A',
    'Department': emp.department || 'N/A',
    'Designation': emp.designation || 'N/A',
    'Gender': emp.gender || 'N/A',
    'Date of Birth': emp.dateOfBirth ? new Date(emp.dateOfBirth).toLocaleDateString() : 'N/A',
    'Joining Date': emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString() : 'N/A',
    'Employment Type': emp.employmentType || 'N/A',
    'Work Location': emp.workLocation || 'N/A',
    'Address': emp.address || 'N/A',
    'City': emp.city || 'N/A',
    'State': emp.state || 'N/A',
    'Zip Code': emp.zipCode || 'N/A',
    'Country': emp.country || 'N/A',
    'Emergency Contact Name': emp.emergencyContactName || 'N/A',
    'Emergency Contact Phone': emp.emergencyContactPhone || 'N/A',
    'Basic Salary': emp.basicSalary || 0,
    'Status': emp.status || 'N/A',
    'Role': emp.userId?.role || 'N/A',
    'Account Status': emp.userId?.isActive ? 'Active' : 'Inactive'
  }));

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 15 }, // Employee Code
    { wch: 15 }, // First Name
    { wch: 15 }, // Last Name
    { wch: 30 }, // Email
    { wch: 15 }, // Phone
    { wch: 20 }, // Department
    { wch: 20 }, // Designation
    { wch: 10 }, // Gender
    { wch: 15 }, // Date of Birth
    { wch: 15 }, // Joining Date
    { wch: 15 }, // Employment Type
    { wch: 15 }, // Work Location
    { wch: 30 }, // Address
    { wch: 15 }, // City
    { wch: 15 }, // State
    { wch: 12 }, // Zip Code
    { wch: 15 }, // Country
    { wch: 25 }, // Emergency Contact Name
    { wch: 20 }, // Emergency Contact Phone
    { wch: 15 }, // Basic Salary
    { wch: 12 }, // Status
    { wch: 12 }, // Role
    { wch: 15 }, // Account Status
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees');

  // Generate buffer
  const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  // Set headers for file download
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=employees_${Date.now()}.xlsx`);

  res.send(excelBuffer);
});
