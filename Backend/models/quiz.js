import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    category: { type: String, default: "General", trim: true },
    timeLimit: { type: Number, required: true, min: 1 },
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date, default: null },
    availableFor: { type: Number, default: 60, min: 1 },
    resultsPublished: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
},
    { timestamps: true }
);

const Quiz = mongoose.model("Quiz", quizSchema);

export default Quiz;