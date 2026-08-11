import mongoose from "mongoose";

const emailVerificationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    otpHash: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
    updatedAt: { type: Date, default: Date.now }
});

// TTL index to automatically delete expired documents
emailVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const EmailVerification = mongoose.model("EmailVerification", emailVerificationSchema);

export default EmailVerification;
