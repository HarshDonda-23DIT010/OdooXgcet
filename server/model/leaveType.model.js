import mongoose from "mongoose";
const leaveTypeSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    name: {
      type: String,
      required: true, // Paid Leave, Sick Leave
    },

    maxDaysPerYear: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("LeaveType", leaveTypeSchema);
