import express from "express";
import Quiz from "../models/quiz.js";

const getQuizzesRouter = express.Router();

getQuizzesRouter.get("/quizzes", async (req, res) => {
    try {
        const now = new Date();

        const allPublishedQuizzes = await Quiz.find({ isPublished: true })
            .select("title description timeLimit publishedAt availableFor createdAt")
            .sort({ createdAt: -1 });

        const quizzesWithTime = allPublishedQuizzes.map(quiz => {
            const publishDate = quiz.publishedAt || quiz.createdAt;
            const expiresAt = new Date(publishDate.getTime() + quiz.availableFor * 60000);
            const isExpired = now >= expiresAt;
            const remainingMinutes = isExpired ? 0 : Math.ceil((expiresAt - now) / 60000);

            return {
                _id: quiz._id,
                title: quiz.title,
                description: quiz.description,
                timeLimit: quiz.timeLimit,
                availableFor: quiz.availableFor,
                remainingMinutes: remainingMinutes,
                expiresAt: expiresAt,
                isExpired: isExpired,
                resultsPublished: quiz.resultsPublished
            };
        });

        return res.status(200).json({
            totalQuizzes: quizzesWithTime.length,
            quizzes: quizzesWithTime
        });

    } catch (error) {
        return res.status(500).json({
            error: "Failed to fetch quizzes",
            details: error.message
        });
    }
});

export default getQuizzesRouter;
