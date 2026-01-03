import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import Salary from "../model/salary.model.js";
import Employee from "../model/employee.model.js";

// ============= EMPLOYEE CONTROLLERS =============

// @desc    Get my salary details
// @route   GET /api/salary/my-salary
// @access  Private (Employee)
export const getMySalary = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find employee
    const employee = await Employee.findOne({ userId });
    if (!employee) {
      throw new ApiError(404, "Employee profile not found");
    }

    // Get salary information from employee profile
    const salaryInfo = {
      employeeId: employee._id,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      employeeCode: employee.employeeCode,
      department: employee.department,
      designation: employee.designation,
      
      // Salary breakdown
      basicSalary: employee.basicSalary || 0,
      allowances: {
        hra: employee.allowances?.hra || 0,
        transport: employee.allowances?.transport || 0,
        medical: employee.allowances?.medical || 0,
        other: employee.allowances?.other || 0
      },
      deductions: {
        tax: employee.deductions?.tax || 0,
        providentFund: employee.deductions?.providentFund || 0,
        insurance: employee.deductions?.insurance || 0,
        other: employee.deductions?.other || 0
      }
    };

    // Calculate totals
    const totalAllowances = Object.values(salaryInfo.allowances).reduce((sum, val) => sum + val, 0);
    const totalDeductions = Object.values(salaryInfo.deductions).reduce((sum, val) => sum + val, 0);
    const grossSalary = salaryInfo.basicSalary + totalAllowances;
    const netSalary = grossSalary - totalDeductions;

    salaryInfo.totalAllowances = totalAllowances;
    salaryInfo.totalDeductions = totalDeductions;
    salaryInfo.grossSalary = grossSalary;
    salaryInfo.netSalary = netSalary;
    salaryInfo.currency = "INR"; // Indian Rupees

    res.status(200).json(
      new ApiResponse(200, salaryInfo, "Salary details retrieved successfully")
    );
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message || "Error fetching salary details");
  }
};

// @desc    Get salary history
// @route   GET /api/salary/my-history
// @access  Private (Employee)
export const getMySalaryHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { year } = req.query;

    // Find employee
    const employee = await Employee.findOne({ userId });
    if (!employee) {
      throw new ApiError(404, "Employee profile not found");
    }

    // For now, return current salary as history
    // In production, you would have a salary history table
    const currentYear = year || new Date().getFullYear();
    const months = [];

    for (let i = 0; i < 12; i++) {
      const month = new Date(currentYear, i, 1);
      const basicSalary = employee.basicSalary || 0;
      const totalAllowances = Object.values(employee.allowances || {}).reduce((sum, val) => sum + (val || 0), 0);
      const totalDeductions = Object.values(employee.deductions || {}).reduce((sum, val) => sum + (val || 0), 0);
      const grossSalary = basicSalary + totalAllowances;
      const netSalary = grossSalary - totalDeductions;

      months.push({
        month: month.toLocaleString('default', { month: 'long' }),
        year: currentYear,
        basicSalary,
        totalAllowances,
        totalDeductions,
        grossSalary,
        netSalary,
        currency: "INR"
      });
    }

    res.status(200).json(
      new ApiResponse(200, months, "Salary history retrieved successfully")
    );
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message || "Error fetching salary history");
  }
};

// ============= ADMIN CONTROLLERS =============

// @desc    Get all employees salary
// @route   GET /api/salary/all
// @access  Private (Admin/HR)
export const getAllEmployeesSalary = async (req, res) => {
  try {
    // Check admin role
    const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'HR';
    if (!isAdmin) {
      throw new ApiError(403, "Access denied. Admin or HR role required");
    }

    const { department, page = 1, limit = 50 } = req.query;

    // Build query
    const query = {};
    if (department) {
      query.department = department;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [employees, total] = await Promise.all([
      Employee.find(query)
        .populate('userId', 'email')
        .select('firstName lastName employeeCode department designation basicSalary allowances deductions')
        .sort({ employeeCode: 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Employee.countDocuments(query)
    ]);

    // Format salary data
    const salaryData = employees.map(employee => {
      const totalAllowances = Object.values(employee.allowances || {}).reduce((sum, val) => sum + (val || 0), 0);
      const totalDeductions = Object.values(employee.deductions || {}).reduce((sum, val) => sum + (val || 0), 0);
      const grossSalary = (employee.basicSalary || 0) + totalAllowances;
      const netSalary = grossSalary - totalDeductions;

      return {
        employeeId: employee._id,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        employeeCode: employee.employeeCode,
        department: employee.department,
        designation: employee.designation,
        email: employee.userId?.email,
        basicSalary: employee.basicSalary || 0,
        allowances: employee.allowances || {},
        deductions: employee.deductions || {},
        totalAllowances,
        totalDeductions,
        grossSalary,
        netSalary,
        currency: "INR"
      };
    });

    res.status(200).json(
      new ApiResponse(200, {
        salaries: salaryData,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit))
        }
      }, "Salary data retrieved successfully")
    );
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message || "Error fetching salary data");
  }
};

// @desc    Update employee salary
// @route   PUT /api/salary/:employeeId
// @access  Private (Admin/HR)
export const updateEmployeeSalary = async (req, res) => {
  try {
    // Check admin role
    const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'HR';
    if (!isAdmin) {
      throw new ApiError(403, "Access denied. Admin or HR role required");
    }

    const { employeeId } = req.params;
    const { basicSalary, allowances, deductions } = req.body;

    // Find employee
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      throw new ApiError(404, "Employee not found");
    }

    // Update salary fields
    if (basicSalary !== undefined) {
      employee.basicSalary = basicSalary;
    }

    if (allowances) {
      employee.allowances = {
        hra: allowances.hra || employee.allowances?.hra || 0,
        transport: allowances.transport || employee.allowances?.transport || 0,
        medical: allowances.medical || employee.allowances?.medical || 0,
        other: allowances.other || employee.allowances?.other || 0
      };
    }

    if (deductions) {
      employee.deductions = {
        tax: deductions.tax || employee.deductions?.tax || 0,
        providentFund: deductions.providentFund || employee.deductions?.providentFund || 0,
        insurance: deductions.insurance || employee.deductions?.insurance || 0,
        other: deductions.other || employee.deductions?.other || 0
      };
    }

    await employee.save();

    // Calculate totals
    const totalAllowances = Object.values(employee.allowances).reduce((sum, val) => sum + val, 0);
    const totalDeductions = Object.values(employee.deductions).reduce((sum, val) => sum + val, 0);
    const grossSalary = employee.basicSalary + totalAllowances;
    const netSalary = grossSalary - totalDeductions;

    const updatedSalaryInfo = {
      employeeId: employee._id,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      employeeCode: employee.employeeCode,
      basicSalary: employee.basicSalary,
      allowances: employee.allowances,
      deductions: employee.deductions,
      totalAllowances,
      totalDeductions,
      grossSalary,
      netSalary,
      currency: "INR"
    };

    res.status(200).json(
      new ApiResponse(200, updatedSalaryInfo, "Salary updated successfully")
    );
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message || "Error updating salary");
  }
};

// @desc    Get salary statistics
// @route   GET /api/salary/statistics
// @access  Private (Admin/HR)
export const getSalaryStatistics = async (req, res) => {
  try {
    // Check admin role
    const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'HR';
    if (!isAdmin) {
      throw new ApiError(403, "Access denied. Admin or HR role required");
    }

    const employees = await Employee.find().select('basicSalary allowances deductions department');

    let totalPayroll = 0;
    let departmentWisePayroll = {};

    employees.forEach(employee => {
      const totalAllowances = Object.values(employee.allowances || {}).reduce((sum, val) => sum + (val || 0), 0);
      const totalDeductions = Object.values(employee.deductions || {}).reduce((sum, val) => sum + (val || 0), 0);
      const netSalary = (employee.basicSalary || 0) + totalAllowances - totalDeductions;

      totalPayroll += netSalary;

      if (employee.department) {
        if (!departmentWisePayroll[employee.department]) {
          departmentWisePayroll[employee.department] = 0;
        }
        departmentWisePayroll[employee.department] += netSalary;
      }
    });

    const statistics = {
      totalEmployees: employees.length,
      totalPayroll,
      averageSalary: employees.length > 0 ? totalPayroll / employees.length : 0,
      departmentWisePayroll,
      currency: "INR"
    };

    res.status(200).json(
      new ApiResponse(200, statistics, "Salary statistics retrieved successfully")
    );
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message || "Error fetching salary statistics");
  }
};
