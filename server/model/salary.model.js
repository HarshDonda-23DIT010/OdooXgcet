const salarySchema = new mongoose.Schema(
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

        monthlySalary: Number,
        yearlySalary: Number,

        basic: Number,
        hra: Number,
        allowances: Number,
        deductions: Number,

        netSalary: Number,
    },
    { timestamps: true }
);

export default mongoose.model("Salary", salarySchema);
