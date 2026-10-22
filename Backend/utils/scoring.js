import Question from "../models/question.js";

/**
 * Calculate score for a set of answers against a quiz's questions.
 * Shared across attempt routes, submit route, and auto-submit scheduler.
 */
const calculateScore = async (answers, quizId) => {
  const questions = await Question.find({ quizId });
  let score = 0;

  for (const question of questions) {
    const userAnswer = answers.find(
      (a) => a.questionId.toString() === question._id.toString()
    );
    if (
      userAnswer &&
      userAnswer.selectedOption !== null &&
      userAnswer.selectedOption !== undefined &&
      userAnswer.selectedOption === question.correctOption
    ) {
      score++;
    }
  }
  return score;
};

export { calculateScore };
