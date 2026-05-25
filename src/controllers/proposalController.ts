import { Response } from "express";
import Proposal from "../models/proposalModel";
import { AuthRequest } from "../middleware/authMiddleware";
import {generateContentHash} from "../utils/hashContent";
import ProposalVersion from "../models/proposalVersionModel";

export const createProposal = async (req: AuthRequest, res: Response) => {
    try {
        const { title, description } = req.body;

        if (!title || !description) {
            return res.status(400).json({
                message: "Title and description are required",
            });
        }

        const proposal = await Proposal.create({
            title,
            description,
            student: req.user?.id,
            status: "DRAFT",
        });

        return res.status(201).json({
            message: "Proposal draft created successfully",
            data: proposal,
        });
    } catch (error: any) {
        console.log("CREATE PROPOSAL ERROR:", error.message);

        return res.status(500).json({
            message: "Failed to create proposal",
            error: error.message,
        });
    }
};

export const getMyProposals = async (req: AuthRequest, res: Response) => {
    try {
        const proposals = await Proposal.find({
            student: req.user?.id,
        })
            .populate("student", "name email role")
            .populate("assignedLecturer", "name email role")
            .populate("latestVersion")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "My proposals fetched successfully",
            data: proposals,
        });
    } catch (error: any) {
        console.log("GET MY PROPOSALS ERROR:", error.message);

        return res.status(500).json({
            message: "Failed to fetch proposals",
            error: error.message,
        });
    }
};

export const getProposalById = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const proposal = await Proposal.findById(id)
            .populate("student", "name email role")
            .populate("assignedLecturer", "name email role")
            .populate("latestVersion");

        if (!proposal) {
            return res.status(404).json({
                message: "Proposal not found",
            });
        }

        return res.status(200).json({
            message: "Proposal fetched successfully",
            data: proposal,
        });
    } catch (error: any) {
        console.log("GET PROPOSAL ERROR:", error.message);

        return res.status(500).json({
            message: "Failed to fetch proposal",
            error: error.message,
        });
    }
};

export const submitProposal = async (req: AuthRequest, res: Response) => {
    try {
        const proposalId = req.params.id;
        const studentId = req.user?.id;

        const proposal = await Proposal.findById(proposalId);

        if (!proposal) {
            return res.status(404).json({
                message: "Proposal not found",
            });
        }

        if (proposal.student.toString() !== studentId) {
            return res.status(403).json({
                message: "You can only submit your own proposal",
            });
        }

        if (
            proposal.status !== "DRAFT" &&
            proposal.status !== "CHANGES_REQUESTED"
        ) {
            return res.status(400).json({
                message: "Only draft or change-requested proposals can be submitted",
            });
        }

        const content = `${proposal.title}\n\n${proposal.description}`;
        const contentHash = generateContentHash(content);

        const latestVersion = await ProposalVersion.findOne({
            proposal: proposal._id,
        }).sort({ versionNumber: -1 });

        if (latestVersion && latestVersion.contentHash === contentHash) {
            return res.status(400).json({
                message: "No changes detected. You cannot submit the same proposal again.",
            });
        }

        const nextVersionNumber = latestVersion
            ? latestVersion.versionNumber + 1
            : 1;

        const proposalVersion = await ProposalVersion.create({
            proposal: proposal._id,
            versionNumber: nextVersionNumber,
            content,
            contentHash,
            submittedBy: studentId,
            locked: true,
        });

        proposal.status = "SUBMITTED";
        proposal.latestVersion = proposalVersion._id as any;

        await proposal.save();

        return res.status(201).json({
            message: "Proposal submitted successfully",
            data: {
                proposal,
                version: proposalVersion,
            },
        });
    } catch (error : any) {
        console.log("SUBMIT PROPOSAL ERROR:", error.message);

        return res.status(500).json({
            message: "Failed to submit proposal",
            error: error.message,
        });
    }
};