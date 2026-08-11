import express from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import User from "../models/user.js";
import EmailVerification from "../models/emailVerification.js";
import sendOTPEmail from "../utils/sendOTPEmail.js";

const registerrouter = express.Router();

registerrouter.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    if (await User.findOne({ email })) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Hash the OTP and the password
    const salt = await bcrypt.genSalt(10);
    const otpHash = await bcrypt.hash(otp, salt);
    const passwordHash = await bcrypt.hash(password, salt);

    // Delete any existing pending registration for this email
    await EmailVerification.deleteMany({ email });

    // Calculate expiration time (10 minutes from now)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Store the pending registration
    await EmailVerification.create({
      name,
      email,
      password: passwordHash,
      otpHash,
      expiresAt
    });

    // Send the email
    const emailSent = await sendOTPEmail(email, otp);

    if (!emailSent) {
      // If email failed to send, delete the pending verification
      await EmailVerification.deleteMany({ email });
      return res.status(500).json({ error: "Failed to send verification email" });
    }

    return res.status(201).json({
      message: "OTP sent to email",
    });
  } catch (error) {
    return res.status(500).json({ error: "Registration failed", details: error.message });
  }
});

export default registerrouter;
