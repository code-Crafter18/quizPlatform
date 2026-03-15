import express from "express";
import Quiz from "../models/quiz.js";
import User from "../models/user.js";
import Attempt from "../models/attempt.js";
import Question from "../models/question.js";

const adminStatsRouter = express.Router();

// GET /api/admin/stats — dashboard summary stats (admin only)
adminStatsRouter.get("/stats", async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ error: "Access denied. Admin only." });
        }

        const totalQuizzes = await Quiz.countDocuments();
        const totalUsers = await User.countDocuments({ role: "user" });

        // Attempts created today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const attemptsToday = await Attempt.countDocuments({
            createdAt: { $gte: startOfDay },
            isSubmitted: true
        });

        // Average score across all submitted attempts
        const submittedAttempts = await Attempt.find({ isSubmitted: true }).select("score quizId");
        let avgScore = null;
        if (submittedAttempts.length > 0) {
            // Get question counts for each unique quiz
            const quizIds = [...new Set(submittedAttempts.map(a => a.quizId.toString()))];
            const questionCounts = {};
            await Promise.all(
                quizIds.map(async (qid) => {
                    questionCounts[qid] = await Question.countDocuments({ quizId: qid });
                })
            );
            const validAttempts = submittedAttempts.filter(a => (questionCounts[a.quizId.toString()] || 0) > 0);
            if (validAttempts.length > 0) {
                const totalPct = validAttempts.reduce((sum, a) => {
                    const total = questionCounts[a.quizId.toString()];
                    return sum + (a.score / total) * 100;
                }, 0);
                avgScore = Math.round(totalPct / validAttempts.length);
            }
        }

        return res.status(200).json({ totalQuizzes, totalUsers, attemptsToday, avgScore });
    } catch (error) {
        return res.status(500).json({ error: "Failed to fetch stats", details: error.message });
    }
});

export default adminStatsRouter;
