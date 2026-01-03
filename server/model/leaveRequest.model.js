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

        leaveTypeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "LeaveType",
            required: true,
        },

        startDate: Date,
        endDate: Date,
        totalDays: Number,

        reason: String,

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
