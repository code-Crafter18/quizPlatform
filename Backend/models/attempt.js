import mongoose from "mongoose";


const attemptSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
    startTime: { type: Date, default: Date.now },
    isSubmitted: { type: Boolean, default: false },
    score: { type: Number, default: 0 },
    answers: [{ 
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
        selectedOption: { type: Number }
    }]
}, { timestamps: true });

const Attempt = mongoose.model("Attempt", attemptSchema);

export default Attempt;