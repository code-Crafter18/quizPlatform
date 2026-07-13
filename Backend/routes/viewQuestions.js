import express from "express";
import Question from "../models/question.js";
import Quiz from "../models/quiz.js";

const viewQuestionsRouter = express.Router();

// GET /api/quiz/:quizId/view-questions — get questions with correct answers (instructor/admin only)
viewQuestionsRouter.get("/:quizId/view-questions", async (req, res) => {
    try {
        if (!["admin", "instructor"].includes(req.user.role)) {
            return res.status(403).json({ error: "Access denied." });
        }

        const { quizId } = req.params;

        const quiz = await Quiz.findById(quizId).select("title timeLimit createdBy");
        if (!quiz) {
            return res.status(404).json({ error: "Quiz not found" });
        }

        // Instructors can only view their own quizzes
        if (req.user.role === "instructor" && quiz.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "You can only view your own quizzes." });
        }

        const questions = await Question.find({ quizId });

        const formattedQuestions = questions.map(q => ({
            questionID: q._id.toString(),
            questionText: q.questionText,
            options: q.options,
            correctOption: q.correctOption
        }));

        return res.status(200).json({
            quizId,
            quizTitle: quiz.title,
            totalQuestions: formattedQuestions.length,
            questions: formattedQuestions,
        });
    } catch (error) {
        return res.status(500).json({ error: "Failed to load questions", details: error.message });
    }
});

export default viewQuestionsRouter;
