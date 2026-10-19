import express from "express";
import QuizInvitation from "../models/quizInvitation.js";
import Quiz from "../models/quiz.js";
import User from "../models/user.js";

const quizInvitationsRouter = express.Router();

quizInvitationsRouter.post("/:quizId/invite", async (req, res) => {
    try {
        if (req.user.role !== "instructor") {
            return res.status(403).json({ error: "Only instructors can invite users." });
        }

        const { quizId } = req.params;
        const { userIds } = req.body;

        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({ error: "Please provide an array of userIds to invite." });
        }

        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ error: "Quiz not found." });
        }
        if (quiz.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "You can only invite users to your own quizzes." });
        }

        const students = await User.find({ _id: { $in: userIds }, role: "user" });
        const validStudentIds = students.map(s => s._id.toString());

        const results = { invited: 0, alreadyInvited: 0, invalid: 0 };

        for (const userId of userIds) {
            if (!validStudentIds.includes(userId)) {
                results.invalid++;
                continue;
            }

            try {
                const existing = await QuizInvitation.findOne({ quizId, userId });
                if (existing) {
                    if (existing.status === "declined") {
                        existing.status = "pending";
                        existing.respondedAt = null;
                        existing.invitedAt = new Date();
                        await existing.save();
                        results.invited++;
                    } else {
                        results.alreadyInvited++;
                    }
                } else {
                    await QuizInvitation.create({
                        quizId,
                        userId,
                        invitedBy: req.user._id,
                        status: "pending"
                    });
                    results.invited++;
                }
            } catch (err) {
                results.alreadyInvited++;
            }
        }

        return res.status(200).json({
            message: `Invited ${results.invited} user(s)`,
            ...results
        });

    } catch (error) {
        return res.status(500).json({ error: "Failed to send invitations", details: error.message });
    }
});

quizInvitationsRouter.get("/my-invitations", async (req, res) => {
    try {
        if (req.user.role !== "user") {
            return res.status(403).json({ error: "Only students can view invitations." });
        }

        const invitations = await QuizInvitation.find({ userId: req.user._id })
            .populate("quizId", "title description timeLimit availableFor isPublished publishedAt createdAt")
            .populate("invitedBy", "name email")
            .sort({ invitedAt: -1 });

        const validInvitations = invitations
            .filter(inv => inv.quizId != null)
            .map(inv => ({
                _id: inv._id,
                quiz: {
                    _id: inv.quizId._id,
                    title: inv.quizId.title,
                    description: inv.quizId.description,
                    timeLimit: inv.quizId.timeLimit,
                    availableFor: inv.quizId.availableFor,
                    isPublished: inv.quizId.isPublished,
                    publishedAt: inv.quizId.publishedAt,
                },
                invitedBy: inv.invitedBy,
                status: inv.status,
                invitedAt: inv.invitedAt,
                respondedAt: inv.respondedAt
            }));

        return res.status(200).json({ invitations: validInvitations });

    } catch (error) {
        return res.status(500).json({ error: "Failed to fetch invitations", details: error.message });
    }
});

quizInvitationsRouter.patch("/invitations/:invitationId/respond", async (req, res) => {
    try {
        const { invitationId } = req.params;
        const { action } = req.body;

        if (!["accept", "decline"].includes(action)) {
            return res.status(400).json({ error: "Action must be 'accept' or 'decline'." });
        }

        const invitation = await QuizInvitation.findById(invitationId);
        if (!invitation) {
            return res.status(404).json({ error: "Invitation not found." });
        }

        if (invitation.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "This invitation does not belong to you." });
        }

        if (invitation.status !== "pending") {
            return res.status(400).json({ error: `Invitation already ${invitation.status}.` });
        }

        invitation.status = action === "accept" ? "accepted" : "declined";
        invitation.respondedAt = new Date();
        await invitation.save();

        return res.status(200).json({
            message: `Invitation ${invitation.status}`,
            invitation: {
                _id: invitation._id,
                status: invitation.status,
                respondedAt: invitation.respondedAt
            }
        });

    } catch (error) {
        return res.status(500).json({ error: "Failed to respond to invitation", details: error.message });
    }
});

quizInvitationsRouter.get("/:quizId/invitations", async (req, res) => {
    try {
        if (req.user.role !== "instructor") {
            return res.status(403).json({ error: "Only instructors can view quiz invitations." });
        }

        const { quizId } = req.params;

        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ error: "Quiz not found." });
        }
        if (quiz.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "You can only view invitations for your own quizzes." });
        }

        const invitations = await QuizInvitation.find({ quizId })
            .populate("userId", "name email")
            .sort({ invitedAt: -1 });

        const formatted = invitations.map(inv => ({
            _id: inv._id,
            user: inv.userId,
            status: inv.status,
            invitedAt: inv.invitedAt,
            respondedAt: inv.respondedAt
        }));

        return res.status(200).json({ invitations: formatted });

    } catch (error) {
        return res.status(500).json({ error: "Failed to fetch invitations", details: error.message });
    }
});

export default quizInvitationsRouter;
