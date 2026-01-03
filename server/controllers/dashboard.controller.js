import Attendance from "../model/attendance.model.js";
import Employee from "../model/employee.model.js";
import LeaveRequest from "../model/leaveRequest.model.js";
import Salary from "../model/salary.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";

// Employee Dashboard Statistics
export const getEmployeeDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find employee by userId
    const employee = await Employee.findOne({ userId });
    if (!employee) {
      throw new ApiError(404, "Employee profile not found");
    }

    // Calculate attendance rate (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const attendanceRecords = await Attendance.find({
      employeeId: employee._id,
      date: { $gte: thirtyDaysAgo }
    });

    const presentDays = attendanceRecords.filter(a => a.status === 'Present' || a.status === 'Half-day').length;
    const totalDays = attendanceRecords.length;
    const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

    // Get leave balance with string-based leave types
    const currentYear = new Date().getFullYear();
    const leaveTypesConfig = [
      { name: 'Casual Leave', maxDays: 8 },
      { name: 'Annual Leave', maxDays: 15 },
      { name: 'Emergency Leave', maxDays: 3 }
    ];
    
    const leaveBalance = await Promise.all(
      leaveTypesConfig.map(async (leaveType) => {
        const approvedLeaves = await LeaveRequest.find({
          employeeId: employee._id,
          leaveType: leaveType.name,
          status: 'APPROVED',
          startDate: {
            $gte: new Date(currentYear, 0, 1),
            $lte: new Date(currentYear, 11, 31)
          }
        });

        const totalDaysUsed = approvedLeaves.reduce((sum, leave) => sum + leave.totalDays, 0);
        const remaining = leaveType.maxDays - totalDaysUsed;

        return {
          leaveType: leaveType.name,
          total: leaveType.maxDays,
          used: totalDaysUsed,
          remaining: remaining > 0 ? remaining : 0
        };
      })
    );

    const totalRemaining = leaveBalance.reduce((sum, leave) => sum + leave.remaining, 0);

    // Get pending leaves count
    const pendingLeaves = await LeaveRequest.countDocuments({
      employeeId: employee._id,
      status: 'PENDING'
    });

    // Get salary info
    const salaryInfo = await Salary.findOne({ employeeId: employee._id })
      .sort({ effectiveFrom: -1 });

    const netSalary = salaryInfo ? salaryInfo.netSalary : 0;

    // Recent activities
    const recentAttendance = await Attendance.find({
      employeeId: employee._id
    })
      .sort({ date: -1 })
      .limit(5)
      .populate('employeeId', 'firstName lastName');

    const recentLeaves = await LeaveRequest.find({
      employeeId: employee._id
    })
      .sort({ createdAt: -1 })
      .limit(3);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          stats: {
            attendanceRate,
            leavesRemaining: totalRemaining,
            pendingLeaves,
            netSalary
          },
          leaveBalance,
          recentActivities: {
            attendance: recentAttendance,
            leaves: recentLeaves
          }
        },
        "Dashboard statistics retrieved successfully"
      )
    );
  } catch (error) {
    console.error('Get employee dashboard stats error:', error);
    const statusCode = error.statusCode || 500;
    const message = error.message || "Failed to get dashboard statistics";
    return res.status(statusCode).json({
      success: false,
      message,
      data: null
    });
  }
};

// Admin Dashboard Statistics
export const getAdminDashboardStats = async (req, res) => {
  try {
    const user = req.user;
    
    // Find admin's company through their employee profile
    const adminEmployee = await Employee.findOne({ userId: user._id });
    if (!adminEmployee) {
      throw new ApiError(404, "Employee profile not found");
    }

    const companyId = adminEmployee.companyId;

    // Get total employees count
    const totalEmployees = await Employee.countDocuments({ companyId });

    // Get today's attendance statistics
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayAttendance = await Attendance.countDocuments({
      companyId,
      date: { $gte: today },
      status: 'Present'
    });

    const absentToday = totalEmployees - todayAttendance;

    // Get pending leave requests
    const pendingLeaves = await LeaveRequest.countDocuments({
      status: 'PENDING'
    });

    // Get approved leaves count (current year)
    const currentYear = new Date().getFullYear();
    const approvedLeaves = await LeaveRequest.countDocuments({
      status: 'APPROVED',
      startDate: {
        $gte: new Date(currentYear, 0, 1),
        $lte: new Date(currentYear, 11, 31)
      }
    });

    // Get total payroll (sum of all net salaries)
    const salaries = await Salary.find({});
    const totalPayroll = salaries.reduce((sum, salary) => sum + salary.netSalary, 0);

    // Get average salary
    const averageSalary = totalEmployees > 0 ? Math.round(totalPayroll / totalEmployees) : 0;

    // Recent activities
    const recentAttendance = await Attendance.find({ companyId })
      .sort({ date: -1 })
      .limit(10)
      .populate('employeeId', 'firstName lastName employeeCode department');

    const recentLeaveRequests = await LeaveRequest.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('employeeId', 'firstName lastName')
      .populate('leaveType', 'name');

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          stats: {
            totalEmployees,
            presentToday: todayAttendance,
            absentToday,
            pendingLeaves,
            approvedLeaves,
            totalPayroll,
            averageSalary
          },
          recentActivities: {
            attendance: recentAttendance,
            leaveRequests: recentLeaveRequests
          }
        },
        "Admin dashboard statistics retrieved successfully"
      )
    );
  } catch (error) {
    console.error('Get admin dashboard stats error:', error);
    const statusCode = error.statusCode || 500;
    const message = error.message || "Failed to get admin dashboard statistics";
    return res.status(statusCode).json({
      success: false,
      message,
      data: null
    });
  }
};
