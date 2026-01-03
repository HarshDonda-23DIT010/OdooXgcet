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

    firstName: String,
    lastName: String,
    phone: String,
    profileImage: String,

    department: String,
    designation: String,

    joiningDate: Date,

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

export default mongoose.model("Employee", employeeSchema);
