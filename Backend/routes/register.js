import express from "express";
import bcrypt from "bcrypt";
import User from "../models/user.js";

const registerrouter = express.Router();

// Email regex pattern
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

registerrouter.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate presence
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }

    const trimmedName = name.trim();
    const sanitizedEmail = email.trim().toLowerCase();

    if (trimmedName.length < 2 || trimmedName.length > 50) {
      return res.status(400).json({ error: "Name must be between 2 and 50 characters" });
    }

    if (!EMAIL_REGEX.test(sanitizedEmail)) {
      return res.status(400).json({ error: "Please provide a valid email address" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }

    // Validate role (only allow user or instructor)
    const validRole = ["user", "instructor"].includes(role) ? role : "user";

    // Check if user already exists
    const existingUser = await User.findOne({ email: sanitizedEmail });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create the user
    const newUser = await User.create({
      name: trimmedName,
      email: sanitizedEmail,
      password: passwordHash,
      role: validRole,
      isApproved: validRole !== "instructor", // Instructors need admin approval
      emailVerified: true
    });

    return res.status(201).json({
      message: validRole === "instructor"
        ? "Registration successful! Your instructor account is pending admin approval."
        : "Registration successful! You can now log in.",
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isApproved: newUser.isApproved
      }
    });
  } catch (error) {
    return res.status(500).json({ error: "Registration failed", details: error.message });
  }
});

export default registerrouter;
