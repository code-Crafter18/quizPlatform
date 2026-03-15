import express from "express";
import User from "../models/user.js";

const userSettingsRouter = express.Router();

// GET /api/user/profile — get current user profile
userSettingsRouter.get("/profile", async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        if (!user) return res.status(404).json({ error: "User not found" });
        return res.status(200).json({ user });
    } catch (error) {
        return res.status(500).json({ error: "Failed to fetch profile", details: error.message });
    }
});

// PATCH /api/user/profile — update name and/or password
userSettingsRouter.patch("/profile", async (req, res) => {
    try {
        const { name, currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ error: "User not found" });

        if (name && name.trim()) {
            user.name = name.trim();
        }

        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ error: "Current password is required to set a new password." });
            }
            if (user.password !== currentPassword) {
                return res.status(400).json({ error: "Current password is incorrect." });
            }
            if (newPassword.length < 4) {
                return res.status(400).json({ error: "New password must be at least 4 characters." });
            }
            user.password = newPassword;
        }

        await user.save();

        return res.status(200).json({
            message: "Profile updated successfully",
            user: { _id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        return res.status(500).json({ error: "Failed to update profile", details: error.message });
    }
});

export default userSettingsRouter;
