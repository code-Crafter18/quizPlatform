import express from "express";
import Quiz from "../models/quiz.js";
import Question from "../models/question.js";
import Attempt from "../models/attempt.js";
import User from "../models/user.js";

const analyticsRouter = express.Router();

// Get quizzes for analytics (admin/instructor)
analyticsRouter.get("/analytics/quizzes", async (req, res) => {
    try {
        if (!["admin", "instructor"].includes(req.user.role)) {
            return res.status(403).json({ error: "Access denied." });
        }

        const filter = req.user.role === "admin"
            ? { isPublished: true }
            : { isPublished: true, createdBy: req.user._id };

        const quizzes = await Quiz.find(filter)
            .select("title description timeLimit availableFor publishedAt resultsPublished createdAt")
            .sort({ createdAt: -1 });

        // Get question count and attempt count for each quiz
        const quizzesWithStats = await Promise.all(
            quizzes.map(async (quiz) => {
                const questionCount = await Question.countDocuments({ quizId: quiz._id });
                const attempts = await Attempt.find({ quizId: quiz._id, isSubmitted: true }).select("score");
                const attemptCount = attempts.length;

                // Calculate average score percentage
                let avgScore = null;
                if (attemptCount > 0 && questionCount > 0) {
                    const totalPct = attempts.reduce((sum, a) => sum + (a.score / questionCount) * 100, 0);
                    avgScore = Math.round(totalPct / attemptCount);
                }

                // Calculate if quiz has expired
                const publishDate = quiz.publishedAt || quiz.createdAt;
                const expiresAt = new Date(publishDate.getTime() + quiz.availableFor * 60000);
                const isExpired = new Date() >= expiresAt;

                return {
                    _id: quiz._id,
                    title: quiz.title,
                    description: quiz.description,
                    timeLimit: quiz.timeLimit,
                    totalMarks: questionCount,
                    attemptCount,
                    avgScore,
                    resultsPublished: quiz.resultsPublished,
                    isExpired,
                    expiresAt
                };
            })
        );

        return res.status(200).json({
            quizzes: quizzesWithStats
        });

    } catch (error) {
        return res.status(500).json({
            error: "Failed to fetch analytics",
            details: error.message
        });
    }
});

// Get detailed analytics for a specific quiz (admin/instructor)
analyticsRouter.get("/analytics/:quizId", async (req, res) => {
    try {
        if (!["admin", "instructor"].includes(req.user.role)) {
            return res.status(403).json({ error: "Access denied." });
        }

        const { quizId } = req.params;

        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ error: "Quiz not found" });
        }

        if (req.user.role === "instructor" && quiz.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "You can only view analytics for your own quizzes." });
        }

        const questionCount = await Question.countDocuments({ quizId });

        // Get all submitted attempts with user details
        const attempts = await Attempt.find({ quizId, isSubmitted: true })
            .populate("userId", "name email")
            .select("userId score createdAt")
            .sort({ createdAt: -1 });

        // Calculate if quiz has expired
        const publishDate = quiz.publishedAt || quiz.createdAt;
        const expiresAt = new Date(publishDate.getTime() + quiz.availableFor * 60000);
        const isExpired = new Date() >= expiresAt;

        // Format attempts with user info
        const formattedAttempts = attempts.map(attempt => ({
            _id: attempt._id,
            studentName: attempt.userId?.name || "Unknown",
            studentEmail: attempt.userId?.email || "Unknown",
            score: attempt.score,
            totalMarks: questionCount,
            percentage: Math.round((attempt.score / questionCount) * 100),
            attemptedAt: attempt.createdAt
        }));

        return res.status(200).json({
            quiz: {
                _id: quiz._id,
                title: quiz.title,
                totalMarks: questionCount,
                resultsPublished: quiz.resultsPublished,
                isExpired,
                expiresAt
            },
            totalAttempts: attempts.length,
            attempts: formattedAttempts
        });

    } catch (error) {
        return res.status(500).json({
            error: "Failed to fetch quiz analytics",
            details: error.message
        });
    }
});

// Publish results for a quiz (instructor only, after quiz expires)
analyticsRouter.post("/publish-results/:quizId", async (req, res) => {
    try {
        if (req.user.role !== "instructor") {
            return res.status(403).json({ error: "Only instructors can publish results." });
        }

        const { quizId } = req.params;

        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ error: "Quiz not found" });
        }

        if (quiz.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "You can only publish results for your own quizzes." });
        }

        // Check if quiz has expired
        const publishDate = quiz.publishedAt || quiz.createdAt;
        const expiresAt = new Date(publishDate.getTime() + quiz.availableFor * 60000);

        if (new Date() < expiresAt) {
            const remainingMinutes = Math.ceil((expiresAt - new Date()) / 60000);
            return res.status(400).json({
                error: `Cannot publish results yet. Quiz is still live for ${remainingMinutes} more minutes.`
            });
        }

        quiz.resultsPublished = true;
        await quiz.save();

        return res.status(200).json({
            message: "Results published successfully",
            resultsPublished: true
        });

    } catch (error) {
        return res.status(500).json({
            error: "Failed to publish results",
            details: error.message
        });
    }
});

// Get student's detailed result for a quiz
analyticsRouter.get("/result/:quizId", async (req, res) => {
    try {
        const { quizId } = req.params;
        const userId = req.user._id;

        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ error: "Quiz not found" });
        }

        // Check if results are published
        if (!quiz.resultsPublished) {
            return res.status(403).json({ error: "Results are not published yet" });
        }

        // Get user's attempt
        const attempt = await Attempt.findOne({ quizId, userId, isSubmitted: true });
        if (!attempt) {
            return res.status(404).json({ error: "You haven't attempted this quiz" });
        }

        // Get all questions for this quiz
        const questions = await Question.find({ quizId })
            .select("questionText options correctOption");

        // Build detailed result
        const detailedResults = questions.map(question => {
            const userAnswer = attempt.answers.find(
                a => a.questionId.toString() === question._id.toString()
            );

            // Check if answer was actually provided (not null/undefined)
            const hasValidAnswer = userAnswer && 
                userAnswer.selectedOption !== null && 
                userAnswer.selectedOption !== undefined;

            return {
                questionId: question._id,
                questionText: question.questionText,
                options: question.options,
                correctOption: question.correctOption,
                selectedOption: hasValidAnswer ? userAnswer.selectedOption : null,
                isCorrect: hasValidAnswer ? userAnswer.selectedOption === question.correctOption : false,
                isAttempted: hasValidAnswer
            };
        });

        return res.status(200).json({
            quiz: {
                title: quiz.title,
                totalMarks: questions.length
            },
            score: attempt.score,
            totalQuestions: questions.length,
            percentage: Math.round((attempt.score / questions.length) * 100),
            results: detailedResults
        });

    } catch (error) {
        return res.status(500).json({
            error: "Failed to fetch result",
            details: error.message
        });
    }
});

export default analyticsRouter;
