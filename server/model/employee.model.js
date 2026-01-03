import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Resume', 'ID Proof', 'Address Proof', 'Education Certificate', 'Experience Letter', 'Other'],
    required: true,
  },
  name: String,
  url: String,
  publicId: String,
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

const employeeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
 
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    employeeCode: {
      type: String,
      unique: true,
      required: true,
    },

    // Personal Details
    firstName: String,
    lastName: String,
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
    },
    phone: String,
    
    // Address
    address: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,

    // Emergency Contact
    emergencyContactName: String,
    emergencyContactPhone: String,

    // Profile Picture
    profileImage: String,
    profileImagePublicId: String,

    // Job Details
    department: String,
    designation: String,
    joiningDate: Date,
    employmentType: {
      type: String,
      enum: ['Full-Time', 'Part-Time', 'Contract', 'Intern'],
      default: 'Full-Time',
    },
    workLocation: {
      type: String,
      enum: ["Office", "Remote", "Hybrid"],
      default: "Office",
    },
    reportingTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },

    // Salary Structure
    basicSalary: {
      type: Number,
      default: 0,
    },
    allowances: {
      hra: { type: Number, default: 0 },
      transport: { type: Number, default: 0 },
      medical: { type: Number, default: 0 },
      other: { type: Number, default: 0 },
    },
    deductions: {
      tax: { type: Number, default: 0 },
      providentFund: { type: Number, default: 0 },
      insurance: { type: Number, default: 0 },
      other: { type: Number, default: 0 },
    },

    // Documents
    documents: [documentSchema],

    // Legacy field for backward compatibility
    workType: {
      type: String,
      enum: ["Office", "Remote", "Hybrid"],
      default: "Office",
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
  },
  { timestamps: true }
);

// Virtual for total salary
employeeSchema.virtual('totalSalary').get(function() {
  const allowancesTotal = Object.values(this.allowances || {}).reduce((sum, val) => sum + (val || 0), 0);
  return (this.basicSalary || 0) + allowancesTotal;
});

// Virtual for total deductions
employeeSchema.virtual('totalDeductions').get(function() {
  return Object.values(this.deductions || {}).reduce((sum, val) => sum + (val || 0), 0);
});

// Virtual for net salary
employeeSchema.virtual('netSalary').get(function() {
  return this.totalSalary - this.totalDeductions;
});

// Ensure virtuals are included in JSON
employeeSchema.set('toJSON', { virtuals: true });
employeeSchema.set('toObject', { virtuals: true });

export default mongoose.model("Employee", employeeSchema);
