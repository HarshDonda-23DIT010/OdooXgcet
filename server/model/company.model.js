import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
        },
        phone: {
            type: String,
        },
        address: {
            type: String,
        },
        logoUrl: {
            type: String,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Company", companySchema);
