import express from "express";
import Quiz from "../models/quiz.js";

const addQuizRouter = express.Router();

addQuizRouter.post("/addquiz", async (req, res) => {
    try {
        const { title, description, category, timeLimit, availableFor } = req.body;

        if (req.user.role !== "instructor" && req.user.role !== "admin") {
            return res.status(403).json({ error: "Only instructors and admins can create quizzes." });
        }

        const createdBy = req.user._id;

        if (!title || !timeLimit) {
            return res.status(400).json({ 
                error: "Title and timeLimit are required fields." 
            });
        }

        const parsedTimeLimit = Number(timeLimit);
        if (isNaN(parsedTimeLimit) || parsedTimeLimit <= 0) {
            return res.status(400).json({ error: "Time limit must be a positive number in minutes." });
        }

        const parsedAvailableFor = availableFor ? Number(availableFor) : 60;
        if (isNaN(parsedAvailableFor) || parsedAvailableFor <= 0) {
            return res.status(400).json({ error: "Available duration must be a positive number in minutes." });
        }

        const newQuiz = await Quiz.create({
            title: title.trim(),
            description: description ? description.trim() : "",
            category: category ? category.trim() : "General",
            timeLimit: parsedTimeLimit,
            availableFor: parsedAvailableFor,
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