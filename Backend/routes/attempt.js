import express from "express";
import Attempt from "../models/attempt.js";
import Quiz from "../models/quiz.js";
import Question from "../models/question.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// Helper function to calculate score from saved answers
const calculateScore = async (answers, quizId) => {
  const questions = await Question.find({ quizId });
  let score = 0;

  for (const question of questions) {
    const userAnswer = answers.find(a => a.questionId.toString() === question._id.toString());
    // Check that selectedOption is not null/undefined before comparing
    if (userAnswer && 
        userAnswer.selectedOption !== null && 
        userAnswer.selectedOption !== undefined && 
        userAnswer.selectedOption === question.correctOption) {
      score++;
    }
  }
  return score;
};

router.post("/start", authMiddleware, async (req, res) => {
  try {
    const { quizId } = req.body;
    const userId = req.user._id;

    // Check quiz exists & is published
    const quiz = await Quiz.findById(quizId);
    if (!quiz || !quiz.isPublished) {
      return res.status(404).json({ message: "Quiz not available" });
    }

    // Check if user already has an attempt for this quiz
    const existingAttempt = await Attempt.findOne({ userId, quizId });

    if (existingAttempt) {
      // Already submitted
      if (existingAttempt.isSubmitted) {
        return res.status(400).json({
          message: "You have already completed this quiz",
          attemptId: existingAttempt._id,
          score: existingAttempt.score
        });
      }

      // Calculate time elapsed (timer runs in background)
      const timeElapsed = (new Date() - existingAttempt.startTime) / 60000;

      // Time expired - auto submit with score based on attempted answers
      if (timeElapsed >= quiz.timeLimit) {
        const score = await calculateScore(existingAttempt.answers, quizId);
        existingAttempt.isSubmitted = true;
        existingAttempt.score = score;
        await existingAttempt.save();

        const totalQuestions = await Question.countDocuments({ quizId });

        return res.status(400).json({
          message: "Time expired. Quiz auto-submitted",
          attemptId: existingAttempt._id,
          score: score,
          totalQuestions: totalQuestions,
          attempted: existingAttempt.answers.length
        });
      }

      // Time remaining - continue quiz (in seconds for precision)
      const remainingTimeSeconds = Math.max(0, Math.round((quiz.timeLimit - timeElapsed) * 60));
      const totalQuestions = await Question.countDocuments({ quizId });

      // Filter out removed answers (null/undefined) and convert questionId to string
      const validAnswers = existingAttempt.answers
        .filter(a => a.selectedOption !== null && a.selectedOption !== undefined)
        .map(a => ({
          questionId: a.questionId.toString(),
          selectedOption: a.selectedOption
        }));

      return res.status(200).json({
        message: "Continue your quiz",
        status: "continue",
        attemptId: existingAttempt._id,
        quizId: quizId,
        quizTitle: quiz.title,
        timeLimit: quiz.timeLimit,
        remainingTime: remainingTimeSeconds,
        remainingTimeUnit: "seconds",
        totalQuestions: totalQuestions,
        attemptedAnswers: validAnswers
      });
    }

    // Create new attempt
    const attempt = await Attempt.create({
      userId,
      quizId,
      startTime: new Date(),
      answers: []
    });

    const totalQuestions = await Question.countDocuments({ quizId });

    res.status(201).json({
      message: "Quiz started",
      status: "started",
      attemptId: attempt._id,
      quizId: quizId,
      quizTitle: quiz.title,
      timeLimit: quiz.timeLimit,
      remainingTime: quiz.timeLimit * 60,
      remainingTimeUnit: "seconds",
      totalQuestions: totalQuestions
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to start quiz",
      error: error.message
    });
  }
});

// Save answer (called when user selects an option)
router.post("/save-answer", authMiddleware, async (req, res) => {
  try {
    const { attemptId, questionId, selectedOption } = req.body;
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

    // Check time
    const quiz = await Quiz.findById(attempt.quizId);
    const timeElapsed = (new Date() - attempt.startTime) / 60000;

    if (timeElapsed >= quiz.timeLimit) {
      // Time expired - auto submit
      const score = await calculateScore(attempt.answers, attempt.quizId);
      attempt.isSubmitted = true;
      attempt.score = score;
      await attempt.save();

      return res.status(400).json({
        message: "Time expired. Quiz auto-submitted",
        score: score
      });
    }

    // Update or add answer
    const existingAnswerIndex = attempt.answers.findIndex(
      a => a.questionId.toString() === questionId
    );

    if (existingAnswerIndex >= 0) {
      attempt.answers[existingAnswerIndex].selectedOption = selectedOption;
    } else {
      attempt.answers.push({ questionId, selectedOption });
    }

    await attempt.save();

    res.status(200).json({
      message: "Answer saved",
      answeredCount: attempt.answers.length
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to save answer",
      error: error.message
    });
  }
});

// Get all user's attempts (for showing attempted status on home page)
router.get("/my-attempts", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;

    const attempts = await Attempt.find({ userId, isSubmitted: true })
      .select("quizId score isSubmitted createdAt")
      .lean();

    res.status(200).json({
      attempts: attempts
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch attempts",
      error: error.message
    });
  }
});

export default router;

