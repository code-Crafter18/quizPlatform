import express from "express";
import Quiz from "../models/quiz.js";
import QuizInvitation from "../models/quizInvitation.js";

const getQuizzesRouter = express.Router();

getQuizzesRouter.get("/quizzes", async (req, res) => {
    try {
        const now = new Date();
        const userId = req.user._id;

        const acceptedInvitations = await QuizInvitation.find({
            userId,
            status: "accepted"
        }).select("quizId");

        const acceptedQuizIds = acceptedInvitations.map(inv => inv.quizId);

        const publishedQuizzes = await Quiz.find({ 
            isPublished: true,
            _id: { $in: acceptedQuizIds }
        })
            .select("title description timeLimit publishedAt availableFor createdAt resultsPublished")
            .sort({ createdAt: -1 });

        const quizzes = publishedQuizzes.map(quiz => {
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
                remainingMinutes,
                expiresAt,
                isExpired,
                resultsPublished: quiz.resultsPublished
            };
        });

        return res.status(200).json({
            totalQuizzes: quizzes.length,
            quizzes
        });
    } catch (error) {
        return res.status(500).json({ error: "Failed to fetch quizzes", details: error.message });
    }
});

export default getQuizzesRouter;
