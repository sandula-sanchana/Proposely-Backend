import { Response } from "express";
import Proposal from "../models/proposalModel";
import User from "../models/userModel";
import { AuthRequest } from "../middleware/authMiddleware";

export const getAllSubmittedProposals = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const proposals = await Proposal.find({
            status: "SUBMITTED",
        })
            .populate("student", "name email role")
            .populate("assignedLecturer", "name email role")
            .populate("latestVersion")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Submitted proposals fetched successfully",
            data: proposals,
        });
    } catch (error: any) {
        console.log("GET SUBMITTED PROPOSALS ERROR:", error.message);

        return res.status(500).json({
            message: "Failed to fetch submitted proposals",
            error: error.message,
        });
    }
};

export const assignLecturerToProposal = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const proposalId = req.params.id;
        const { lecturerId } = req.body;

        if (!lecturerId) {
            return res.status(400).json({
                message: "Lecturer ID is required",
            });
        }

        const proposal = await Proposal.findById(proposalId);

        if (!proposal) {
            return res.status(404).json({
                message: "Proposal not found",
            });
        }

        if (proposal.status !== "SUBMITTED") {
            return res.status(400).json({
                message: "Only submitted proposals can be assigned",
            });
        }

        const lecturer = await User.findById(lecturerId);

        if (!lecturer) {
            return res.status(404).json({
                message: "Lecturer not found",
            });
        }

        if (lecturer.role !== "LECTURER") {
            return res.status(400).json({
                message: "Selected user is not a lecturer",
            });
        }

        const updatedProposal = await Proposal.findByIdAndUpdate(
            proposalId,
            {
                assignedLecturer: lecturerId,
                status: "ASSIGNED",
            },
            { new: true }
        )
            .populate("student", "name email role")
            .populate("assignedLecturer", "name email role")
            .populate("latestVersion");

        return res.status(200).json({
            message: "Lecturer assigned successfully",
            data: updatedProposal,
        });
    } catch (error: any) {
        console.log("ASSIGN LECTURER ERROR:", error.message);

        return res.status(500).json({
            message: "Failed to assign lecturer",
            error: error.message,
        });
    }
};