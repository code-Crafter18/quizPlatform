import Attempt from "../models/attempt.js";
import Quiz from "../models/quiz.js";
import { calculateScore } from "./scoring.js";

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
