import mongoose from "mongoose";

const quizInvitationSchema = new mongoose.Schema({
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { 
        type: String, 
        enum: ["pending", "accepted", "declined"],
        default: "pending" 
    },
    invitedAt: { type: Date, default: Date.now },
    respondedAt: { type: Date, default: null }
}, { timestamps: true });

// Ensure one invitation per user per quiz
quizInvitationSchema.index({ quizId: 1, userId: 1 }, { unique: true });

const QuizInvitation = mongoose.model("QuizInvitation", quizInvitationSchema);

export default QuizInvitation;
