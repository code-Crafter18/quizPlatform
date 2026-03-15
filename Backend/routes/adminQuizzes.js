import express from "express";
import Quiz from "../models/quiz.js";
import Question from "../models/question.js";

const adminQuizzesRouter = express.Router();

// Get quizzes for admin/instructor
adminQuizzesRouter.get("/admin/quizzes", async (req, res) => {
    try {
        if (!["admin", "instructor"].includes(req.user.role)) {
            return res.status(403).json({ error: "Access denied." });
        }

        const filter = req.user.role === "admin" ? {} : { createdBy: req.user._id };

        const quizzes = await Quiz.find(filter)
            .select("title description timeLimit availableFor isPublished createdAt publishedAt")
            .sort({ createdAt: -1 });

        // Get question count for each quiz
        const quizzesWithCount = await Promise.all(
            quizzes.map(async (quiz) => {
                const questionCount = await Question.countDocuments({ quizId: quiz._id });
                return {
                    _id: quiz._id,
                    title: quiz.title,
                    description: quiz.description,
                    timeLimit: quiz.timeLimit,
                    availableFor: quiz.availableFor,
                    isPublished: quiz.isPublished,
                    createdAt: quiz.createdAt,
                    publishedAt: quiz.publishedAt,
                    questionCount
                };
            })
        );

        return res.status(200).json({
            totalQuizzes: quizzesWithCount.length,
            quizzes: quizzesWithCount
        });

    } catch (error) {
        return res.status(500).json({
            error: "Failed to fetch quizzes",
            details: error.message
        });
    }
});

export default adminQuizzesRouter;
