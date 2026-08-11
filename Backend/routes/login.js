import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { JWT_SECRET } from "../middleware/auth.js";

const loginrouter = express.Router();

loginrouter.post("/login", async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(400).json({ error: "email or password is invalid" });
        }

        // Normally all users in the db should be verified if they registered through the new flow,
        // but this adds an extra layer of protection if somehow unverified users are created
        if (user.emailVerified === false) {
             return res.status(403).json({ error: "Please verify your email before logging in." });
        }

        let isMatch = false;
        if (user.password === req.body.password) {
            // Legacy plaintext match
            isMatch = true;
        } else {
            // Check bcrypt hash
            try {
                isMatch = await bcrypt.compare(req.body.password, user.password);
            } catch (err) {
                isMatch = false;
            }
        }

        if (isMatch) {
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
                    emailVerified: user.emailVerified
                }
            });
        } else {
            return res.status(400).json({ error: "email or password is invalid" });
        }
    } catch (error) {
        return res.status(500).json({ error: "Server error", details: error.message });
    }
});

export default loginrouter;
