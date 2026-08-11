import express from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import EmailVerification from "../models/emailVerification.js";
import sendOTPEmail from "../utils/sendOTPEmail.js";

const resendOTPRouter = express.Router();

resendOTPRouter.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const pendingVerification = await EmailVerification.findOne({ email });

    if (!pendingVerification) {
      return res.status(404).json({ error: "No pending registration found for this email." });
    }

    // Check cooldown (45 seconds)
    const now = new Date();
    const lastUpdated = pendingVerification.updatedAt || pendingVerification.expiresAt; // Fallback if updatedAt isn't set somehow
    const timeSinceLastUpdate = now.getTime() - lastUpdated.getTime();
    
    if (timeSinceLastUpdate < 45 * 1000) {
      return res.status(429).json({ error: `Please wait before requesting a new OTP.` });
    }

    // Generate new OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const salt = await bcrypt.genSalt(10);
    const otpHash = await bcrypt.hash(otp, salt);

    // Update the record
    pendingVerification.otpHash = otpHash;
    pendingVerification.attempts = 0;
    pendingVerification.expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    pendingVerification.updatedAt = new Date();
    
    await pendingVerification.save();

    // Send the email
    const emailSent = await sendOTPEmail(email, otp);

    if (!emailSent) {
      return res.status(500).json({ error: "Failed to send new verification email" });
    }

    return res.status(200).json({ message: "A new OTP has been sent to your email" });

  } catch (error) {
    return res.status(500).json({ error: "Failed to resend OTP", details: error.message });
  }
});

export default resendOTPRouter;
