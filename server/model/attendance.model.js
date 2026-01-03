const attendanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
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

    checkInTime: Date,
    checkOutTime: Date,

    workHours: Number,

    status: {
      type: String,
      enum: ["PRESENT", "ABSENT", "HALF_DAY", "LEAVE"],
      default: "PRESENT",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Attendance", attendanceSchema);
