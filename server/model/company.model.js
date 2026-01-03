import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        logoUrl: {
            type: String,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Company", companySchema);
