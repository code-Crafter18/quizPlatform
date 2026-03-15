import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    timeLimit: { type: Number, required: true },
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date, default: null },
    availableFor: { type: Number, default: 60 },
    resultsPublished: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
},
    { timestamps: true }
);

const Quiz = mongoose.model("Quiz", quizSchema);

export default Quiz;