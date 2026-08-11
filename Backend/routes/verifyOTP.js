import express from "express";
import bcrypt from "bcrypt";
import User from "../models/user.js";
import EmailVerification from "../models/emailVerification.js";

const verifyOTPRouter = express.Router();

verifyOTPRouter.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    const pendingVerification = await EmailVerification.findOne({ email });

    if (!pendingVerification) {
      return res.status(404).json({ error: "No pending verification found for this email. It may have expired." });
    }

    if (pendingVerification.attempts >= 5) {
      return res.status(429).json({ error: "Maximum verification attempts reached. Please request a new OTP." });
    }

    const isMatch = await bcrypt.compare(otp, pendingVerification.otpHash);

    if (!isMatch) {
      pendingVerification.attempts += 1;
      await pendingVerification.save();
      return res.status(400).json({ error: "Invalid OTP", attemptsLeft: 5 - pendingVerification.attempts });
    }

    // OTP is correct, create the user
    const newUser = await User.create({
      name: pendingVerification.name,
      email: pendingVerification.email,
      password: pendingVerification.password,
      role: "user",
      emailVerified: true
    });

    // Clean up pending verification
    await EmailVerification.deleteOne({ email });

    return res.status(201).json({
      message: "Email verified and account created successfully",
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        emailVerified: newUser.emailVerified
      }
    });

  } catch (error) {
    return res.status(500).json({ error: "Verification failed", details: error.message });
  }
});

export default verifyOTPRouter;
