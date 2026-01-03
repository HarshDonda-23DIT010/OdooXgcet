import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

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

    date: {
      type: Date,
      required: true,
    },

    checkIn: Date,
    checkOut: Date,

    workingHours: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["Present", "Absent", "Half-day", "Leave"],
      default: "Absent",
    },

    notes: String,
  },
  { timestamps: true }
);

// Index for faster queries
attendanceSchema.index({ employeeId: 1, date: 1 });
attendanceSchema.index({ userId: 1, date: 1 });

// Calculate working hours before saving
attendanceSchema.pre('save', function(next) {
  if (this.checkIn && this.checkOut) {
    const diffMs = this.checkOut - this.checkIn;
    this.workingHours = Number((diffMs / (1000 * 60 * 60)).toFixed(2)); // Convert to hours
  }
  next();
});

export default mongoose.model("Attendance", attendanceSchema);
