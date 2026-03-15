import express from "express";
import Quiz from "../models/quiz.js";

const publishQuizRouter = express.Router();

publishQuizRouter.patch("/:quizId/publish", async (req, res) => {
    try {
        if (req.user.role !== "instructor") {
            return res.status(403).json({ error: "Only instructors can publish quizzes." });
        }

        const { quizId } = req.params;
        const { availableFor } = req.body; // duration in minutes
        const userId = req.user._id;

        const quiz = await Quiz.findById(quizId);

        if (!quiz) {
            return res.status(404).json({ error: "Quiz not found" });
        }

        if (quiz.createdBy.toString() !== userId.toString()) {
            return res.status(403).json({ error: "You can only publish your own quizzes" });
        }

        // Toggle the isPublished status
        if (quiz.isPublished) {
            // Unpublish
            quiz.isPublished = false;
            quiz.publishedAt = null;
        } else {
            // Publish with duration
            // Publish with duration
            // Use provided availableFor or existing one, otherwise default to 60
            const duration = availableFor || quiz.availableFor || 60;

            if (duration <= 0) {
                return res.status(400).json({
                    error: "Invalid duration"
                });
            }

            quiz.isPublished = true;
            quiz.publishedAt = new Date();
            quiz.availableFor = duration;
        }

        await quiz.save();

        // Calculate end time for response
        let availableUntil = null;
        if (quiz.isPublished) {
            availableUntil = new Date(quiz.publishedAt.getTime() + quiz.availableFor * 60000);
        }

        return res.status(200).json({
            message: quiz.isPublished ? "Quiz published successfully" : "Quiz unpublished successfully",
            isPublished: quiz.isPublished,
            publishedAt: quiz.publishedAt,
            availableFor: quiz.availableFor,
            availableUntil: availableUntil
        });

    } catch (error) {
        return res.status(500).json({
            error: "Failed to update quiz",
            details: error.message
        });
    }
});

export default publishQuizRouter;
