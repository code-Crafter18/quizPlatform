import express from "express";
import bcrypt from "bcrypt";
import User from "../models/user.js";

const registerrouter = express.Router();

registerrouter.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate role (only allow user or instructor)
    const validRole = ["user", "instructor"].includes(role) ? role : "user";

    // Check if user already exists
    if (await User.findOne({ email })) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create the user directly
    const newUser = await User.create({
      name,
      email,
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
