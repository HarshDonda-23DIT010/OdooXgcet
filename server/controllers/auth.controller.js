import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import User from "../model/user.model.js";
import Employee from "../model/employee.model.js";
import Company from "../model/company.model.js";
import { generateJWTToken } from "../utils/jwtToken.js";
import { sendEmail, emailTemplates } from "../config/email.js";
import crypto from "crypto";

// Password validation helper
const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (password.length < minLength) {
    return { valid: false, message: "Password must be at least 8 characters long" };
  }
  if (!hasUpperCase) {
    return { valid: false, message: "Password must contain at least one uppercase letter" };
  }
  if (!hasLowerCase) {
    return { valid: false, message: "Password must contain at least one lowercase letter" };
  }
  if (!hasNumber) {
    return { valid: false, message: "Password must contain at least one number" };
  }
  if (!hasSpecialChar) {
    return { valid: false, message: "Password must contain at least one special character" };
  }

  return { valid: true };
};

// @desc    Sign Up / Register User
// @route   POST /api/auth/signup
// @access  Public
export const signup = asyncHandler(async (req, res, next) => {
  const { employeeId, email, password, role, firstName, lastName, phone, department, designation } = req.body;

  // Validate required fields
  if (!employeeId || !email || !password) {
    throw new ApiError(400, "Employee ID, email, and password are required");
  }

  // Validate password security rules
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    throw new ApiError(400, passwordValidation.message);
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ApiError(400, "Please provide a valid email address");
  }

  // Validate role
  if (role && !["ADMIN", "HR", "EMPLOYEE"].includes(role)) {
    throw new ApiError(400, "Invalid role. Must be ADMIN, HR, or EMPLOYEE");
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new ApiError(409, "User with this email already exists");
  }

  // Check if employee ID already exists
  const existingEmployee = await Employee.findOne({ employeeCode: employeeId });
  if (existingEmployee) {
    throw new ApiError(409, "Employee ID already exists");
  }

  // For demo purposes, create a default company if none exists
  let company = await Company.findOne();
  if (!company) {
    company = await Company.create({
      name: "Default Company",
      email: "admin@company.com",
      phone: "1234567890",
      address: "Default Address",
    });
  }

  // Generate email verification OTP (6 digits)
  const verificationOTP = Math.floor(100000 + Math.random() * 900000).toString();
  const verificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Create user
  const user = await User.create({
    companyId: company._id,
    email: email.toLowerCase(),
    password,
    role: role || "EMPLOYEE",
    emailVerificationOTP: verificationOTP,
    emailVerificationOTPExpires: verificationExpires,
    isEmailVerified: false,
  });

  // Create employee profile
  const employee = await Employee.create({
    userId: user._id,
    companyId: company._id,
    employeeCode: employeeId,
    firstName: firstName || "",
    lastName: lastName || "",
    phone: phone || "",
    department: department || "",
    designation: designation || "",
    joiningDate: new Date(),
  });

  // Send verification email
  let emailSent = false;
  try {
    await sendEmail(
      user.email,
      emailTemplates.verification(verificationOTP, firstName || "User")
    );
    emailSent = true;
    console.log("✅ Verification email sent successfully to:", user.email);
  } catch (emailError) {
    // If email fails, still allow registration but log the error
    console.error("❌ Failed to send verification email:", emailError.message);
    console.error("Full error:", emailError);
  }

  // Return user data without password
  const userResponse = {
    _id: user._id,
    email: user.email,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
    emailSent: emailSent,
    employee: {
      employeeCode: employee.employeeCode,
      firstName: employee.firstName,
      lastName: employee.lastName,
    },
  };

  res.status(201).json(
    new ApiResponse(
      201,
      userResponse,
      emailSent 
        ? "Registration successful! Please check your email to verify your account."
        : "Registration successful! However, we couldn't send the verification email. Please try 'Resend OTP' on the verification page."
    )
  );
});

// @desc    Verify Email
// @route   GET /api/auth/verify-email/:token
// @access  Public with OTP
// @route   POST /api/auth/verify-email
// @access  Public
export const verifyEmail = asyncHandler(async (req, res, next) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw new ApiError(400, "Email and OTP are required");
  }

  // Find user with valid OTP
  const user = await User.findOne({
    email: email.toLowerCase(),
    emailVerificationOTP: otp,
    emailVerificationOTPExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, "Invalid or expired OTP");
  }

  // Update user
  user.isEmailVerified = true;
  user.emailVerificationOTP = undefined;
  user.emailVerificationOTPExpires = undefined;
  await user.save();

  // Get employee details
  const employee = await Employee.findOne({ userId: user._id });

  // Send welcome email
  try {
    await sendEmail(
      user.email,
      emailTemplates.welcome(employee?.firstName || "User")
    );
  } catch (emailError) {
    console.error("Failed to send welcome email:", emailError);
  }

  res.status(200).json(
    new ApiResponse(200, null, "Email verified successfully! You can now log in.")
  );
});

// @desc    Sign In / Login
// @route   POST /api/auth/signin
// @access  Public
export const signin = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate required fields
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  // Find user by email
  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  // Check if user is active
  if (!user.isActive) {
    throw new ApiError(403, "Your account has been deactivated. Please contact HR.");
  }

  // Check if email is verified
  if (!user.isEmailVerified) {
    throw new ApiError(403, "Please verify your email before logging in");
  }

  // Check password
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid email or password");
  }

  // Get employee details
  const employee = await Employee.findOne({ userId: user._id });

  // Prepare user response
  const userResponse = {
    _id: user._id,
    email: user.email,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
    employee: employee ? {
      _id: employee._id,
      employeeCode: employee.employeeCode,
      firstName: employee.firstName,
      lastName: employee.lastName,
      phone: employee.phone,
      department: employee.department,
      designation: employee.designation,
      profileImage: employee.profileImage,
      status: employee.status,
    } : null,
  };

  // Generate JWT token and send response with cookie
  return generateJWTToken(
    userResponse,
    "Login successful",
    200,
    res
  );
});

// @desc    Logout
// @route   POST /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
      secure: true,
      sameSite: "none",
    })
    .json(new ApiResponse(200, null, "Logged out successfully"));
});

// @desc    Get Current User
// @route   GET /api/auth/me
// @access  Private
export const getCurrentUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("-password");
  const employee = await Employee.findOne({ userId: user._id });

  const userResponse = {
    _id: user._id,
    email: user.email,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
    employee: employee ? {
      _id: employee._id,
      employeeCode: employee.employeeCode,
      firstName: employee.firstName,
      lastName: employee.lastName,
      phone: employee.phone,
      department: employee.department,
      designation: employee.designation,
      profileImage: employee.profileImage,
      status: employee.status,
    } : null,
  };

  res.status(200).json(new ApiResponse(200, userResponse, "User fetched successfully"));
});

// @route   POST /api/auth/resend-verification
// @access  Public
export const resendVerificationEmail = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.isEmailVerified) {
    throw new ApiError(400, "Email is already verified");
  }

  // Generate new OTP
  const verificationOTP = Math.floor(100000 + Math.random() * 900000).toString();
  const verificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  user.emailVerificationOTP = verificationOTP;
  user.emailVerificationOTPExpires = verificationExpires;
  await user.save();

  // Get employee details for personalization
  const employee = await Employee.findOne({ userId: user._id });

  // Send verification email
  await sendEmail(
    user.email,
    emailTemplates.verification(verificationOTP, employee?.firstName || "User")
  );

  res.status(200).json(
    new ApiResponse(200, null, "Verification OTP sent successfully to your email")
  );
});
