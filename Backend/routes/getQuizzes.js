import express from "express";
import Quiz from "../models/quiz.js";
import QuizInvitation from "../models/quizInvitation.js";
import Attempt from "../models/attempt.js";
import Question from "../models/question.js";

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

        // Batch fetch student's attempts for these quizzes (avoids N+1)
        const attempts = await Attempt.find({
            userId,
            quizId: { $in: acceptedQuizIds },
            isSubmitted: true
        }).select("quizId score isSubmitted createdAt").lean();

        const attemptMap = {};
        attempts.forEach(a => {
            attemptMap[a.quizId.toString()] = a;
        });

        // Batch fetch question counts for these quizzes (avoids N+1)
        const questionCounts = await Question.aggregate([
            { $match: { quizId: { $in: acceptedQuizIds } } },
            { $group: { _id: "$quizId", count: { $sum: 1 } } }
        ]);

        const questionCountMap = {};
        questionCounts.forEach(qc => {
            questionCountMap[qc._id.toString()] = qc.count;
        });

        const quizzes = publishedQuizzes.map(quiz => {
            const publishDate = quiz.publishedAt || quiz.createdAt;
            const expiresAt = new Date(publishDate.getTime() + quiz.availableFor * 60000);
            const isExpired = now >= expiresAt;
            const remainingMinutes = isExpired ? 0 : Math.ceil((expiresAt - now) / 60000);
            const userAttempt = attemptMap[quiz._id.toString()] || null;
            const totalQuestions = questionCountMap[quiz._id.toString()] || 0;

            return {
                _id: quiz._id,
                title: quiz.title,
                description: quiz.description,
                timeLimit: quiz.timeLimit,
                availableFor: quiz.availableFor,
                remainingMinutes,
                expiresAt,
                isExpired,
                resultsPublished: quiz.resultsPublished,
                totalQuestions,
                attempt: userAttempt ? {
                    isSubmitted: true,
                    score: quiz.resultsPublished ? userAttempt.score : null
                } : null
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
