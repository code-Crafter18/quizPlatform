import express from "express";
import Question from "../models/question.js";
import Quiz from "../models/quiz.js";

const addQroute = express.Router();

addQroute.post("/addquestion", async (req, res) => {
    try {
        const { quizId, questionText, options, correctOption } = req.body;

        if (req.user.role !== "instructor") {
            return res.status(403).json({ error: "Only instructors can add questions." });
        }

        if (!quizId || !questionText || !options || correctOption === undefined) {
            return res.status(400).json({
                error: "quizId, questionText, options, and correctOption are required"
            });
        }

        if (!Array.isArray(options) || options.length < 2) {
            return res.status(400).json({
                error: "Options must be an array with at least 2 choices"
            });
        }

        if (correctOption < 0 || correctOption >= options.length) {
            return res.status(400).json({
                error: "correctOption must be a valid index within options array"
            });
        }

        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ error: "Quiz not found" });
        }

        if (quiz.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "You can only edit your own quizzes." });
        }

        if (quiz.isPublished) {
            return res.status(400).json({ error: "Cannot add questions to a published quiz." });
        }

        const newQuestion = await Question.create({
            quizId,
            questionText,
            options,
            correctOption
        });

        return res.status(201).json({
            message: "Question added successfully",
            question: newQuestion
        });

    } catch (error) {
        return res.status(500).json({
            error: "Failed to add question",
            details: error.message
        });
    }
});

export default addQroute;