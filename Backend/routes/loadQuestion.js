import express from "express";
import Question from "../models/question.js";
import Quiz from "../models/quiz.js";

const loadQrouter = express.Router();

loadQrouter.get("/:quizID/questions", async (req, res) => {
    try {
        const { quizID } = req.params;

        // Fetch quiz to get timeLimit
        const quiz = await Quiz.findById(quizID).select("title timeLimit");
        if (!quiz) {
            return res.status(404).json({ error: "Quiz not found" });
        }

        const questions = await Question.find({ quizId: quizID });

        const finalQuestions = questions.map(q => ({
            questionID: q._id.toString(),
            questionText: q.questionText,
            options: q.options
        }));

        return res.status(200).json({
            quizID,
            quizTitle: quiz.title,
            timeLimit: quiz.timeLimit * 60, // Convert minutes to seconds
            totalquestion: finalQuestions.length,
            questions: finalQuestions,
        });
    } catch (error) {
        return res.status(500).json({ error: "Failed to load questions", details: error.message });
    }
});

export default loadQrouter;