import express from "express";
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

        if (user.password === req.body.password) {
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
                    role: user.role
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
