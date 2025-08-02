import mongoose from "mongoose";

const OtpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: '20m' // OTP will expire after 20 minutes
    }
});

const Otp = mongoose.model("Otp", OtpSchema);
export default Otp;
