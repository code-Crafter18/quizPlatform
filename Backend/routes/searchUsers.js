import express from "express";
import User from "../models/user.js";

const searchUsersRouter = express.Router();

searchUsersRouter.get("/search-users", async (req, res) => {
    try {
        if (req.user.role !== "instructor") {
            return res.status(403).json({ error: "Only instructors can search for users." });
        }

        const { q } = req.query;

        if (!q || q.trim().length < 2) {
            return res.status(400).json({ error: "Search query must be at least 2 characters." });
        }

        const searchRegex = new RegExp(q.trim(), "i");

        const users = await User.find({
            role: "user",
            $or: [
                { name: searchRegex },
                { email: searchRegex }
            ]
        })
        .select("name email _id")
        .limit(20)
        .lean();

        return res.status(200).json({ users });

    } catch (error) {
        return res.status(500).json({ error: "Failed to search users", details: error.message });
    }
});

export default searchUsersRouter;
