import express from "express";
import Attempt from "../models/attempt.js";
import Quiz from "../models/quiz.js";
import Question from "../models/question.js";
import { authMiddleware } from "../middleware/auth.js";

const submitRouter = express.Router();

// Submit quiz manually
submitRouter.post("/submit", authMiddleware, async (req, res) => {
  try {
    const { attemptId } = req.body;
    const userId = req.user._id;

    const attempt = await Attempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found" });
    }

    if (attempt.userId.toString() !== userId) {
      return res.status(403).json({ message: "This is not your attempt" });
    }

    if (attempt.isSubmitted) {
      return res.status(400).json({ message: "Quiz already submitted" });
    }

    const quiz = await Quiz.findById(attempt.quizId);
    const timeTaken = (new Date() - attempt.startTime) / 60000;

    // Calculate score from saved answers
    const questions = await Question.find({ quizId: attempt.quizId });
    let score = 0;
    const results = [];

    for (const question of questions) {
      const userAnswer = attempt.answers.find(
        a => a.questionId.toString() === question._id.toString()
      );
      // Check that selectedOption is not null/undefined before comparing
      const isCorrect = userAnswer && 
        userAnswer.selectedOption !== null && 
        userAnswer.selectedOption !== undefined && 
        userAnswer.selectedOption === question.correctOption;

      if (isCorrect) score++;

      results.push({
        questionId: question._id,
        questionText: question.questionText,
        options: question.options,
        correctOption: question.correctOption,
        selectedOption: userAnswer ? userAnswer.selectedOption : null,
        isCorrect
      });
    }

    // Update attempt
    attempt.isSubmitted = true;
    attempt.score = score;
    await attempt.save();

    res.status(200).json({
      message: "Quiz submitted successfully",
      score,
      totalQuestions: questions.length,
      attempted: attempt.answers.length,
      percentage: Math.round((score / questions.length) * 100),
      timeTaken: Math.round(timeTaken),
      results
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to submit quiz",
      error: error.message
    });
  }
});

export default submitRouter;
