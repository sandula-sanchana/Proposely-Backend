import { Response } from "express";
import Proposal from "../models/proposalModel";
import { AuthRequest } from "../middleware/authMiddleware";
import ProposalReview from "../models/proposalReviewModel";
import ProposalComment from "../models/proposalCommentModel";
import ProposalVersion from "../models/proposalVersionModel";
import {generateAIReview} from "../services/aiReviewService";
import ProposalAIReview from "../models/proposalAIReviewModel";

export const getMyAssignedProposals = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const proposals = await Proposal.find({
            assignedLecturer: req.user?.id,
            status: {
                $in: ["ASSIGNED", "SUBMITTED", "CHANGES_REQUESTED"],
            },
        })
            .populate("student", "name email role")
            .populate("assignedLecturer", "name email role")
            .populate("latestVersion")
            .sort({ updatedAt: -1 });

        return res.status(200).json({
            message: "Lecturer proposals fetched successfully",
            data: proposals,
        });
    } catch (error: any) {
        console.log("GET LECTURER PROPOSALS ERROR:", error.message);

        return res.status(500).json({
            message: "Failed to fetch lecturer proposals",
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

        if (!["ASSIGNED", "SUBMITTED"].includes(proposal.status)) {
            return res.status(400).json({
                message: "Only assigned or submitted proposals can be reviewed",
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

export const addProposalComment = async (req: AuthRequest, res: Response) => {
    try {
        const proposalId = req.params.id;
        const lecturerId = req.user?.id;

        const {
            commentText,
            selectedText,
            startIndex,
            endIndex,
        } = req.body;

        if (!commentText) {
            return res.status(400).json({
                message: "Comment text is required",
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
                message: "You can only comment on proposals assigned to you",
            });
        }

        if (!proposal.latestVersion) {
            return res.status(400).json({
                message: "Proposal has no submitted version to comment on",
            });
        }

        const comment = await ProposalComment.create({
            proposal: proposal._id,
            proposalVersion: proposal.latestVersion,
            lecturer: lecturerId,
            commentText,
            selectedText,
            startIndex,
            endIndex,
            resolved: false,
        });

        return res.status(201).json({
            message: "Comment added successfully",
            data: comment,
        });
    } catch (error: any) {
        console.log("ADD COMMENT ERROR:", error.message);

        return res.status(500).json({
            message: "Failed to add comment",
            error: error.message,
        });
    }
};

export const getProposalComments = async (req: AuthRequest, res: Response) => {
    try {
        const proposalId = req.params.id;

        const comments = await ProposalComment.find({
            proposal: proposalId,
        })
            .populate("lecturer", "name email role")
            .populate("proposalVersion", "versionNumber contentHash createdAt")
            .sort({ createdAt: 1 });

        return res.status(200).json({
            message: "Proposal comments fetched successfully",
            data: comments,
        });
    } catch (error: any) {
        console.log("GET COMMENTS ERROR:", error.message);

        return res.status(500).json({
            message: "Failed to fetch comments",
            error: error.message,
        });
    }
};

export const getProposalVersions = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const proposalId = req.params.id;
        const lecturerId = req.user?.id;

        const proposal = await Proposal.findById(proposalId);

        if (!proposal) {
            return res.status(404).json({
                message: "Proposal not found",
            });
        }

        if (proposal.assignedLecturer?.toString() !== lecturerId) {
            return res.status(403).json({
                message: "You can only view versions of proposals assigned to you",
            });
        }

        const versions = await ProposalVersion.find({
            proposal: proposalId,
        })
            .populate("submittedBy", "name email role")
            .sort({ versionNumber: 1 });

        return res.status(200).json({
            message: "Proposal versions fetched successfully",
            data: {
                proposal: {
                    _id: proposal._id,
                    title: proposal.title,
                    status: proposal.status,
                    latestVersion: proposal.latestVersion,
                },
                versions,
            },
        });
    } catch (error: any) {
        console.log("GET PROPOSAL VERSIONS ERROR:", error.message);

        return res.status(500).json({
            message: "Failed to fetch proposal versions",
            error: error.message,
        });
    }
};

const extractSuggestedDecision = (aiText: string) => {
    const upperText = aiText.toUpperCase();

    if (upperText.includes("CHANGES_REQUESTED")) {
        return "CHANGES_REQUESTED";
    }

    if (upperText.includes("APPROVED")) {
        return "APPROVED";
    }

    if (upperText.includes("REJECTED")) {
        return "REJECTED";
    }

    return "UNKNOWN";
};

const extractConfidenceLevel = (aiText: string) => {
    const upperText = aiText.toUpperCase();

    if (
        upperText.includes("CONFIDENCE LEVEL:** HIGH") ||
        upperText.includes("CONFIDENCE LEVEL: HIGH") ||
        upperText.includes("CONFIDENCE:** HIGH") ||
        upperText.includes("CONFIDENCE: HIGH")
    ) {
        return "HIGH";
    }

    if (
        upperText.includes("CONFIDENCE LEVEL:** MEDIUM") ||
        upperText.includes("CONFIDENCE LEVEL: MEDIUM") ||
        upperText.includes("CONFIDENCE:** MEDIUM") ||
        upperText.includes("CONFIDENCE: MEDIUM")
    ) {
        return "MEDIUM";
    }

    if (
        upperText.includes("CONFIDENCE LEVEL:** LOW") ||
        upperText.includes("CONFIDENCE LEVEL: LOW") ||
        upperText.includes("CONFIDENCE:** LOW") ||
        upperText.includes("CONFIDENCE: LOW")
    ) {
        return "LOW";
    }

    return "UNKNOWN";
};

export const generateProposalAIReview = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const proposalId = req.params.id;
        const lecturerId = req.user?.id;

        const proposal = await Proposal.findById(proposalId);

        if (!proposal) {
            return res.status(404).json({
                message: "Proposal not found",
            });
        }

        if (proposal.assignedLecturer?.toString() !== lecturerId) {
            return res.status(403).json({
                message: "You can only generate AI review for proposals assigned to you",
            });
        }

        const versions = await ProposalVersion.find({
            proposal: proposalId,
        }).sort({ versionNumber: 1 });

        if (versions.length < 2) {
            return res.status(400).json({
                message: "At least two proposal versions are required for AI comparison",
            });
        }

        const previousVersion = versions[versions.length - 2];
        const latestVersion = versions[versions.length - 1];

        const reviews = await ProposalReview.find({
            proposal: proposalId,
            proposalVersion: previousVersion._id,
        }).sort({ createdAt: -1 });

        const comments = await ProposalComment.find({
            proposal: proposalId,
            proposalVersion: previousVersion._id,
        }).sort({ createdAt: 1 });

        const latestVersionComments = await ProposalComment.find({
            proposal: proposalId,
            proposalVersion: latestVersion._id,
        }).sort({ createdAt: 1 });

        const prompt = `
You are an AI Review Assistant for an academic project proposal review system.

Your task is to compare the student's previous proposal version and latest proposal version, then evaluate whether the lecturer's feedback and comments were addressed.

Important rules:
- Do not make the final academic decision.
- Only assist the lecturer.
- Be fair, concise, and practical.
- If evidence is not enough, say so.
- Return the answer in clear sections.

Proposal title:
${proposal.title}

Previous version number:
${previousVersion.versionNumber}

Previous version content:
${previousVersion.content}

Latest version number:
${latestVersion.versionNumber}

Latest version content:
${latestVersion.content}

Lecturer review feedback on previous version:
${reviews.length > 0
            ? reviews.map((review: any, index: number) => `
Review ${index + 1}
Decision: ${review.decision}
Feedback: ${review.feedback}
`).join("\n")
            : "No formal review feedback found for previous version."
        }

Lecturer inline comments on previous version:
${comments.length > 0
            ? comments.map((comment: any, index: number) => `
Comment ${index + 1}
Selected text: ${comment.selectedText || "N/A"}
Comment: ${comment.commentText}
Resolved by student: ${comment.resolved ? "Yes" : "No"}
`).join("\n")
            : "No inline comments found for previous version."
        }

Inline comments already added on latest version:
${latestVersionComments.length > 0
            ? latestVersionComments.map((comment: any, index: number) => `
Latest Version Comment ${index + 1}
Selected text: ${comment.selectedText || "N/A"}
Comment: ${comment.commentText}
Resolved: ${comment.resolved ? "Yes" : "No"}
`).join("\n")
            : "No inline comments found for latest version."
        }

Return your answer using this structure:

1. Summary of Changes
- Explain what changed from previous version to latest version.

2. Feedback Coverage
- For each lecturer feedback/comment, say:
  - Addressed / Partially Addressed / Not Addressed
  - Reason

3. Remaining Issues
- List issues that still need lecturer attention.

4. Suggested Lecturer Decision
- Choose one:
  - APPROVED
  - CHANGES_REQUESTED
  - REJECTED
- Explain that this is only a recommendation and the lecturer makes the final decision.

5. Confidence Level
- High / Medium / Low
- Explain why.
`;

        const aiResult = await generateAIReview(prompt);

        const suggestedDecision = extractSuggestedDecision(aiResult);
        const confidenceLevel = extractConfidenceLevel(aiResult);

        const savedAIReview = await ProposalAIReview.create({
            proposal: proposal._id,
            previousVersion: previousVersion._id,
            latestVersion: latestVersion._id,
            lecturer: lecturerId,
            aiReviewText: aiResult,
            suggestedDecision,
            confidenceLevel,
        });

        return res.status(200).json({
            message: "AI review generated and saved successfully",
            data: {
                proposal: {
                    _id: proposal._id,
                    title: proposal.title,
                    status: proposal.status,
                },
                comparedVersions: {
                    previousVersion: {
                        _id: previousVersion._id,
                        versionNumber: previousVersion.versionNumber,
                    },
                    latestVersion: {
                        _id: latestVersion._id,
                        versionNumber: latestVersion.versionNumber,
                    },
                },
                aiReview: savedAIReview,
            },
        });
    } catch (error: any) {
        console.log("AI REVIEW ERROR:", error.message);

        return res.status(500).json({
            message: "Failed to generate AI review",
            error: error.message,
        });
    }
};

export const getProposalAIReviewHistory = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const proposalId = req.params.id;
        const lecturerId = req.user?.id;

        const proposal = await Proposal.findById(proposalId);

        if (!proposal) {
            return res.status(404).json({
                message: "Proposal not found",
            });
        }

        if (proposal.assignedLecturer?.toString() !== lecturerId) {
            return res.status(403).json({
                message: "You can only view AI reviews for proposals assigned to you",
            });
        }

        const aiReviews = await ProposalAIReview.find({
            proposal: proposalId,
        })
            .populate("lecturer", "name email role")
            .populate("previousVersion", "versionNumber contentHash createdAt")
            .populate("latestVersion", "versionNumber contentHash createdAt")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "AI review history fetched successfully",
            data: aiReviews,
        });
    } catch (error: any) {
        console.log("GET AI REVIEW HISTORY ERROR:", error.message);

        return res.status(500).json({
            message: "Failed to fetch AI review history",
            error: error.message,
        });
    }
};