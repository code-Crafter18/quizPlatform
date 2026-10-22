import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import registerrouter from "./routes/register.js";

import loadQrouter from "./routes/loadQuestion.js";
import loginrouter from "./routes/login.js";
import addQuizRouter from "./routes/addQuiz.js";
import addQroute from "./routes/addQuestion.js";
import getQuizzesRouter from "./routes/getQuizzes.js";
import publishQuizRouter from "./routes/publishQuiz.js";
import attemptrouter from "./routes/attempt.js";
import submitRouter from "./routes/submitQuiz.js";
import adminQuizzesRouter from "./routes/adminQuizzes.js";
import analyticsRouter from "./routes/analytics.js";
import adminStatsRouter from "./routes/adminStats.js";
import manageUsersRouter from "./routes/manageUsers.js";
import userSettingsRouter from "./routes/userSettings.js";
import { authMiddleware } from "./middleware/auth.js";
import aiQuizRoutes from "./routes/aiQuiz.js";
import viewQuestionsRouter from "./routes/viewQuestions.js";
import quizInvitationsRouter from "./routes/quizInvitations.js";
import searchUsersRouter from "./routes/searchUsers.js";

dotenv.config({ path: "./Backend/.env" });
dotenv.config();

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("QuizMaster API is running");
});

app.use("/api/quiz", loadQrouter);
app.use("/api/quiz", authMiddleware, getQuizzesRouter);
app.use("/api/quiz", authMiddleware, addQuizRouter);
app.use("/api/quiz", authMiddleware, addQroute);
app.use("/api/quiz", authMiddleware, publishQuizRouter);
app.use("/api/quiz", authMiddleware, attemptrouter);
app.use("/api/quiz", authMiddleware, submitRouter);
app.use("/api/quiz", authMiddleware, adminQuizzesRouter);
app.use("/api/quiz", authMiddleware, analyticsRouter);
app.use("/api/quiz", authMiddleware, viewQuestionsRouter);
app.use("/api/quiz", authMiddleware, quizInvitationsRouter);
app.use("/api/quiz", authMiddleware, searchUsersRouter);
app.use("/api/admin", authMiddleware, adminStatsRouter);
app.use("/api/admin", authMiddleware, manageUsersRouter);
app.use("/api/user", registerrouter, loginrouter);
app.use("/api/user", authMiddleware, userSettingsRouter);
app.use("/api/ai", authMiddleware, aiQuizRoutes);

mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/projects", { dbName: "projects" })
  .then(() => {
    console.log("MongoDB connected");
    import("./utils/autoSubmit.js").then(({ startAutoSubmitScheduler }) => {
      startAutoSubmitScheduler();
    });
  })
  .catch((err) => {
    console.log("Connection error:", err);
  });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`);
})