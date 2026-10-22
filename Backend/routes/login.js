import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { JWT_SECRET } from "../middleware/auth.js";

const loginrouter = express.Router();

loginrouter.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        const sanitizedEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: sanitizedEmail });

        if (!user) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        // Check if instructor is approved
        if (user.role === "instructor" && !user.isApproved) {
            return res.status(403).json({ 
                error: "Your instructor account is pending admin approval.",
                pendingApproval: true
            });
        }

        const token = jwt.sign(
            {
                _id: user._id,
                email: user.email,
                role: user.role,
                name: user.name
            },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        return res.status(200).json({
            message: "login successful",
            token: token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isApproved: user.isApproved,
                emailVerified: user.emailVerified
            }
        });
    } catch (error) {
        return res.status(500).json({ error: "Server error", details: error.message });
    }
});

export default loginrouter;
