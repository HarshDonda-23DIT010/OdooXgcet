import mongoose from "mongoose";
const leaveRequestSchema = new mongoose.Schema(
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

        leaveType: {
            type: String,
            required: true,
        },

        leaveTypeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "LeaveType",
        },

        startDate: Date,
        endDate: Date,
        totalDays: Number,

        reason: String,

        comments: String, // Admin comments

        status: {
            type: String,
            enum: ["PENDING", "APPROVED", "REJECTED"],
            default: "PENDING",
        },

        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },

        approvedAt: Date,
    },
    { timestamps: true }
);

export default mongoose.model("LeaveRequest", leaveRequestSchema);
