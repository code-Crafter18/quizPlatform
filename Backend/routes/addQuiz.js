import express from "express";
import Quiz from "../models/quiz.js";

const addQuizRouter = express.Router();

addQuizRouter.post("/addquiz", async (req, res) => {
    try {
        const { title, description, timeLimit, availableFor } = req.body;

        if (req.user.role !== "instructor") {
            return res.status(403).json({ error: "Only instructors can create quizzes." });
        }

        const createdBy = req.user._id;

        if (!title || !timeLimit) {
            return res.status(400).json({ 
                error: "title and timeLimit are required fields" 
            });
        }

        const newQuiz = await Quiz.create({
            title,
            description,
            timeLimit,
            availableFor: availableFor || 60,
            isPublished: false,
            createdBy
        });

        return res.status(201).json({ 
            message: "Quiz created successfully", 
            quiz: newQuiz 
        });

    } catch (error) {
        return res.status(500).json({ 
            error: "Failed to create quiz", 
            details: error.message 
        });
    }
});

export default addQuizRouter;