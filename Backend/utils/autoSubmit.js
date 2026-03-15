import Attempt from "../models/attempt.js";
import Quiz from "../models/quiz.js";
import Question from "../models/question.js";

// Helper function to calculate score
const calculateScore = async (answers, quizId) => {
  const questions = await Question.find({ quizId });
  let score = 0;

  for (const question of questions) {
    const userAnswer = answers.find(a => a.questionId.toString() === question._id.toString());
    if (userAnswer && userAnswer.selectedOption === question.correctOption) {
      score++;
    }
  }
  return score;
};

// Auto-submit expired attempts
const autoSubmitExpiredAttempts = async () => {
  try {
    // Find all unsubmitted attempts
    const pendingAttempts = await Attempt.find({ isSubmitted: false });

    for (const attempt of pendingAttempts) {
      const quiz = await Quiz.findById(attempt.quizId);
      if (!quiz) continue;

      const timeElapsed = (new Date() - attempt.startTime) / 60000;

      // Check if time expired
      if (timeElapsed >= quiz.timeLimit) {
        const score = await calculateScore(attempt.answers, attempt.quizId);
        attempt.isSubmitted = true;
        attempt.score = score;
        await attempt.save();
      }
    }
  } catch (error) {
    console.error("Auto-submit error:", error.message);
  }
};

// Run every 1 minute
const startAutoSubmitScheduler = () => {
  console.log("Auto-submit scheduler started");
  setInterval(autoSubmitExpiredAttempts, 60000); // 60000ms = 1 minute
};

export { startAutoSubmitScheduler, autoSubmitExpiredAttempts };
