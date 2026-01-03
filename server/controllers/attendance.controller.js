import Attendance from "../model/attendance.model.js";
import Employee from "../model/employee.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";

// Employee: Check in
export const checkIn = async (req, res) => {
  try {
   
    const userId = req.user._id;
    const { notes } = req.body;

    // Find employee by userId
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
      throw new ApiError(400, "Already checked in today");
    }

    // Create or update attendance record
    const attendance = existingAttendance || new Attendance({
      employeeId: employee._id,
      userId: req.user._id,
      companyId: employee.companyId,
      date: new Date()
    });

    attendance.checkIn = new Date();
    attendance.status = "Present";
    if (notes) attendance.notes = notes;

    await attendance.save();

    const populatedAttendance = await Attendance.findById(attendance._id)
      .populate('employeeId', 'firstName lastName employeeCode department')
      .populate('userId', 'email');

    return res.status(200).json(
      new ApiResponse(200, populatedAttendance, "Checked in successfully")
    );
  } catch (error) {
    console.error('Check in error:', error);
    const statusCode = error.statusCode || 500;
    const message = error.message || "Failed to check in";
    return res.status(statusCode).json({
      success: false,
      message,
      data: null
    });
  }
};

// Employee: Check out
export const checkOut = async (req, res) => {
  try {
    const userId = req.user._id;
    const { notes } = req.body;

    // Find employee by userId
    const employee = await Employee.findOne({ userId });
    if (!employee) {
      throw new ApiError(404, "Employee profile not found");
    }

    // Find today's attendance record
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const attendance = await Attendance.findOne({
      employeeId: employee._id,
      date: { $gte: today }
    });

    if (!attendance || !attendance.checkIn) {
      throw new ApiError(400, "No check-in record found for today");
    }

    if (attendance.checkOut) {
      throw new ApiError(400, "Already checked out today");
    }

    attendance.checkOut = new Date();
    if (notes) attendance.notes = notes;

    await attendance.save();

    const populatedAttendance = await Attendance.findById(attendance._id)
      .populate('employeeId', 'firstName lastName employeeCode department')
      .populate('userId', 'email');

    return res.status(200).json(
      new ApiResponse(200, populatedAttendance, "Checked out successfully")
    );
  } catch (error) {
    console.error('Check out error:', error);
    const statusCode = error.statusCode || 500;
    const message = error.message || "Failed to check out";
    return res.status(statusCode).json({
      success: false,
      message,
      data: null
    });
  }
};

// Employee: Get today's attendance
export const getTodayAttendance = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find employee by userId
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
    })
      .populate('employeeId', 'firstName lastName employeeCode department')
      .populate('userId', 'email');

    return res.status(200).json(
      new ApiResponse(200, attendance, "Today's attendance retrieved successfully")
    );
  } catch (error) {
    console.error('Get today attendance error:', error);
    const statusCode = error.statusCode || 500;
    const message = error.message || "Failed to get today's attendance";
    return res.status(statusCode).json({
      success: false,
      message,
      data: null
    });
  }
};

// Employee: Get my attendance history
export const getMyAttendance = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Find employee by userId
    const employee = await Employee.findOne({ userId });
    if (!employee) {
      throw new ApiError(404, "Employee profile not found");
    }

    // Build query
    const query = { employeeId: employee._id };

    // Get total count
    const totalRecords = await Attendance.countDocuments(query);

    // Get attendance records
    const attendance = await Attendance.find(query)
      .populate('employeeId', 'firstName lastName employeeCode department')
      .populate('userId', 'email')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(totalRecords / limit),
      totalRecords,
      hasMore: page * limit < totalRecords
    };

    return res.status(200).json(
      new ApiResponse(200, { attendance, pagination }, "Attendance history retrieved successfully")
    );
  } catch (error) {
    console.error('Get my attendance error:', error);
    const statusCode = error.statusCode || 500;
    const message = error.message || "Failed to get attendance history";
    return res.status(statusCode).json({
      success: false,
      message,
      data: null
    });
  }
};

// Admin: Get all attendance records
export const getAllAttendance = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build query from filters
    const query = {};
    
    if (req.query.startDate || req.query.endDate) {
      query.date = {};
      if (req.query.startDate) {
        query.date.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        const endDate = new Date(req.query.endDate);
        endDate.setHours(23, 59, 59, 999);
        query.date.$lte = endDate;
      }
    }

    if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.employeeId) {
      query.employeeId = req.query.employeeId;
    }

    // Get total count
    const totalRecords = await Attendance.countDocuments(query);

    // Get attendance records
    const attendance = await Attendance.find(query)
      .populate('employeeId', 'firstName lastName employeeCode department')
      .populate('userId', 'email')
      .sort({ date: -1, checkIn: -1 })
      .skip(skip)
      .limit(limit);

    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(totalRecords / limit),
      totalRecords,
      hasMore: page * limit < totalRecords
    };

    return res.status(200).json(
      new ApiResponse(200, { attendance, pagination }, "All attendance records retrieved successfully")
    );
  } catch (error) {
    console.error('Get all attendance error:', error);
    const statusCode = error.statusCode || 500;
    const message = error.message || "Failed to get all attendance records";
    return res.status(statusCode).json({
      success: false,
      message,
      data: null
    });
  }
};

// Admin: Get attendance summary
export const getAttendanceSummary = async (req, res) => {
  try {
    // Build query from filters
    const query = {};
    
    if (req.query.startDate || req.query.endDate) {
      query.date = {};
      if (req.query.startDate) {
        query.date.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        const endDate = new Date(req.query.endDate);
        endDate.setHours(23, 59, 59, 999);
        query.date.$lte = endDate;
      }
    }

    // Aggregate by status
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
      total: 0,
      Present: 0,
      Absent: 0,
      'Half-day': 0,
      Leave: 0
    };

    summary.forEach(item => {
      formattedSummary[item._id] = item.count;
      formattedSummary.total += item.count;
    });

    return res.status(200).json(
      new ApiResponse(200, formattedSummary, "Attendance summary retrieved successfully")
    );
  } catch (error) {
    console.error('Get attendance summary error:', error);
    const statusCode = error.statusCode || 500;
    const message = error.message || "Failed to get attendance summary";
    return res.status(statusCode).json({
      success: false,
      message,
      data: null
    });
  }
};

// Admin: Export attendance to Excel
export const exportAttendanceToExcel = async (req, res) => {
  try {
    // Build query from filters
    const query = {};
    
    if (req.query.startDate || req.query.endDate) {
      query.date = {};
      if (req.query.startDate) {
        query.date.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        const endDate = new Date(req.query.endDate);
        endDate.setHours(23, 59, 59, 999);
        query.date.$lte = endDate;
      }
    }

    if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.employeeId) {
      query.employeeId = req.query.employeeId;
    }

    // Get all attendance records
    const attendanceRecords = await Attendance.find(query)
      .populate('employeeId', 'firstName lastName employeeCode department')
      .sort({ date: -1, checkIn: -1 });

    // Convert to CSV format
    const csvHeader = 'Employee Code,Employee Name,Department,Date,Check In,Check Out,Working Hours,Status,Notes\n';
    const csvRows = attendanceRecords.map(record => {
      const employeeName = `${record.employeeId?.firstName || ''} ${record.employeeId?.lastName || ''}`.trim();
      const date = record.date ? new Date(record.date).toLocaleDateString() : 'N/A';
      const checkIn = record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : 'N/A';
      const checkOut = record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : 'N/A';
      const workingHours = record.workingHours || 0;
      const notes = record.notes ? `"${record.notes.replace(/"/g, '""')}"` : '';

      return `${record.employeeId?.employeeCode || ''},${employeeName},${record.employeeId?.department || ''},${date},${checkIn},${checkOut},${workingHours},${record.status},${notes}`;
    }).join('\n');

    const csvContent = csvHeader + csvRows;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=attendance_${Date.now()}.csv`);
    return res.status(200).send(csvContent);
  } catch (error) {
    console.error('Export attendance error:', error);
    const statusCode = error.statusCode || 500;
    const message = error.message || "Failed to export attendance";
    return res.status(statusCode).json({
      success: false,
      message,
      data: null
    });
  }
};

// Admin: Export employees list to Excel
export const exportEmployeesToExcel = async (req, res) => {
  try {
    // Get all employees
    const employees = await Employee.find()
      .populate('userId', 'email')
      .sort({ employeeCode: 1 });

    // Convert to CSV format
    const csvHeader = 'Employee Code,First Name,Last Name,Email,Department,Designation,Join Date,Phone,Status\n';
    const csvRows = employees.map(emp => {
      const email = emp.userId?.email || '';
      const joinDate = emp.joinDate ? new Date(emp.joinDate).toLocaleDateString() : 'N/A';
      
      return `${emp.employeeCode || ''},${emp.firstName || ''},${emp.lastName || ''},${email},${emp.department || ''},${emp.designation || ''},${joinDate},${emp.phone || ''},${emp.status || ''}`;
    }).join('\n');

    const csvContent = csvHeader + csvRows;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=employees_${Date.now()}.csv`);
    return res.status(200).send(csvContent);
  } catch (error) {
    console.error('Export employees error:', error);
    const statusCode = error.statusCode || 500;
    const message = error.message || "Failed to export employees";
    return res.status(statusCode).json({
      success: false,
      message,
      data: null
    });
  }
};

// Admin: Manually mark attendance for an employee
export const markAttendanceForEmployee = async (req, res) => {
  try {
    const { employeeId, date, checkIn, checkOut, status, notes } = req.body;

    // Validate required fields
    if (!employeeId || !date || !status) {
      throw new ApiError(400, "Employee ID, date, and status are required");
    }

    // Check if employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      throw new ApiError(404, "Employee not found");
    }

    // Check if attendance already exists for this date
    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);
    
    const existingAttendance = await Attendance.findOne({
      employeeId,
      date: {
        $gte: attendanceDate,
        $lt: new Date(attendanceDate.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    if (existingAttendance) {
      throw new ApiError(400, "Attendance record already exists for this date");
    }

    // Create attendance record
    const attendance = new Attendance({
      employeeId,
      userId: employee.userId,
      companyId: employee.companyId,
      date: attendanceDate,
      checkIn: checkIn ? new Date(checkIn) : null,
      checkOut: checkOut ? new Date(checkOut) : null,
      status,
      notes
    });

    await attendance.save();

    const populatedAttendance = await Attendance.findById(attendance._id)
      .populate('employeeId', 'firstName lastName employeeCode department')
      .populate('userId', 'email');

    return res.status(201).json(
      new ApiResponse(201, populatedAttendance, "Attendance marked successfully")
    );
  } catch (error) {
    console.error('Mark attendance error:', error);
    const statusCode = error.statusCode || 500;
    const message = error.message || "Failed to mark attendance";
    return res.status(statusCode).json({
      success: false,
      message,
      data: null
    });
  }
};

// Admin: Update attendance record
export const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { checkIn, checkOut, status, notes } = req.body;

    const attendance = await Attendance.findById(id);
    if (!attendance) {
      throw new ApiError(404, "Attendance record not found");
    }

    // Update fields
    if (checkIn !== undefined) attendance.checkIn = checkIn ? new Date(checkIn) : null;
    if (checkOut !== undefined) attendance.checkOut = checkOut ? new Date(checkOut) : null;
    if (status) attendance.status = status;
    if (notes !== undefined) attendance.notes = notes;

    await attendance.save();

    const populatedAttendance = await Attendance.findById(attendance._id)
      .populate('employeeId', 'firstName lastName employeeCode department')
      .populate('userId', 'email');

    return res.status(200).json(
      new ApiResponse(200, populatedAttendance, "Attendance updated successfully")
    );
  } catch (error) {
    console.error('Update attendance error:', error);
    const statusCode = error.statusCode || 500;
    const message = error.message || "Failed to update attendance";
    return res.status(statusCode).json({
      success: false,
      message,
      data: null
    });
  }
};

// Admin: Delete attendance record
export const deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    const attendance = await Attendance.findByIdAndDelete(id);
    if (!attendance) {
      throw new ApiError(404, "Attendance record not found");
    }

    return res.status(200).json(
      new ApiResponse(200, null, "Attendance deleted successfully")
    );
  } catch (error) {
    console.error('Delete attendance error:', error);
    const statusCode = error.statusCode || 500;
    const message = error.message || "Failed to delete attendance";
    return res.status(statusCode).json({
      success: false,
      message,
      data: null
    });
  }
};
