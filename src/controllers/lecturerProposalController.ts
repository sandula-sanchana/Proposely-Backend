import { Response } from "express";
import Proposal from "../models/proposalModel";
import { AuthRequest } from "../middleware/authMiddleware";
import ProposalReview from "../models/proposalReviewModel";

export const getMyAssignedProposals = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const proposals = await Proposal.find({
            assignedLecturer: req.user?.id,
            status: "ASSIGNED",
        })
            .populate("student", "name email role")
            .populate("assignedLecturer", "name email role")
            .populate("latestVersion")
            .sort({ updatedAt: -1 });

        return res.status(200).json({
            message: "Assigned proposals fetched successfully",
            data: proposals,
        });
    } catch (error: any) {
        console.log("GET ASSIGNED PROPOSALS ERROR:", error.message);

        return res.status(500).json({
            message: "Failed to fetch assigned proposals",
            error: error.message,
        });
    }
};

export const reviewProposal = async (req: AuthRequest, res: Response) => {
    try {
        const proposalId = req.params.id;
        const lecturerId = req.user?.id;
        const { decision, feedback } = req.body;

        if (!decision || !feedback) {
            return res.status(400).json({
                message: "Decision and feedback are required",
            });
        }

        const allowedDecisions = [
            "APPROVED",
            "REJECTED",
            "CHANGES_REQUESTED",
        ];

        if (!allowedDecisions.includes(decision)) {
            return res.status(400).json({
                message: "Invalid decision",
            });
        }

        const proposal = await Proposal.findById(proposalId);

        if (!proposal) {
            return res.status(404).json({
                message: "Proposal not found",
            });
        }

        if (proposal.assignedLecturer?.toString() !== lecturerId) {
            return res.status(403).json({
                message: "You can only review proposals assigned to you",
            });
        }

        if (proposal.status !== "ASSIGNED") {
            return res.status(400).json({
                message: "Only assigned proposals can be reviewed",
            });
        }

        if (!proposal.latestVersion) {
            return res.status(400).json({
                message: "Proposal has no submitted version to review",
            });
        }

        const review = await ProposalReview.create({
            proposal: proposal._id,
            proposalVersion: proposal.latestVersion,
            lecturer: lecturerId,
            decision,
            feedback,
        });

        proposal.status = decision;
        await proposal.save();

        return res.status(200).json({
            message: "Proposal reviewed successfully",
            data: {
                proposal,
                review,
            },
        });
    } catch (error: any) {
        console.log("REVIEW PROPOSAL ERROR:", error.message);

        return res.status(500).json({
            message: "Failed to review proposal",
            error: error.message,
        });
    }
};