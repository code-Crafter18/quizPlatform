import express from "express";
import User from "../models/user.js";
import Attempt from "../models/attempt.js";

const manageUsersRouter = express.Router();

// GET /api/admin/users — list all users (admin only)
manageUsersRouter.get("/users", async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ error: "Access denied. Admin only." });
        }

        const users = await User.find().select("-password").sort({ _id: -1 });

        // Attach attempt count per user
        const usersWithStats = await Promise.all(
            users.map(async (u) => {
                const attemptCount = u.role === "user"
                    ? await Attempt.countDocuments({ userId: u._id, isSubmitted: true })
                    : 0;
                return {
                    _id: u._id,
                    name: u.name,
                    email: u.email,
                    role: u.role,
                    attemptCount
                };
            })
        );

        return res.status(200).json({ users: usersWithStats });
    } catch (error) {
        return res.status(500).json({ error: "Failed to fetch users", details: error.message });
    }
});

// PATCH /api/admin/users/:userId/role — promote/demote user role (admin only)
manageUsersRouter.patch("/users/:userId/role", async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ error: "Access denied. Admin only." });
        }

        const { userId } = req.params;
        const { role } = req.body;

        if (!(["user", "admin"].includes(role))) {
            return res.status(400).json({ error: "Invalid role. Must be 'user' or 'admin'." });
        }

        // Prevent admin from demoting themselves
        if (userId === req.user._id.toString()) {
            return res.status(400).json({ error: "You cannot change your own role." });
        }

        const user = await User.findByIdAndUpdate(userId, { role }, { new: true }).select("-password");
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        return res.status(200).json({ message: "Role updated", user });
    } catch (error) {
        return res.status(500).json({ error: "Failed to update role", details: error.message });
    }
});

// DELETE /api/admin/users/:userId — delete a user (admin only)
manageUsersRouter.delete("/users/:userId", async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ error: "Access denied. Admin only." });
        }

        const { userId } = req.params;

        if (userId === req.user._id.toString()) {
            return res.status(400).json({ error: "You cannot delete your own account here." });
        }

        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        return res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        return res.status(500).json({ error: "Failed to delete user", details: error.message });
    }
});

export default manageUsersRouter;
