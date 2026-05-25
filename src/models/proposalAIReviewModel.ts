import mongoose, { Document, Schema } from "mongoose";

export type AISuggestedDecision =
    | "APPROVED"
    | "CHANGES_REQUESTED"
    | "REJECTED"
    | "UNKNOWN";

export type AIConfidenceLevel =
    | "HIGH"
    | "MEDIUM"
    | "LOW"
    | "UNKNOWN";

export interface IProposalAIReview extends Document {
    proposal: mongoose.Types.ObjectId;
    previousVersion: mongoose.Types.ObjectId;
    latestVersion: mongoose.Types.ObjectId;
    lecturer: mongoose.Types.ObjectId;

    aiReviewText: string;
    suggestedDecision: AISuggestedDecision;
    confidenceLevel: AIConfidenceLevel;

    createdAt: Date;
    updatedAt: Date;
}

const proposalAIReviewSchema = new Schema<IProposalAIReview>(
    {
        proposal: {
            type: Schema.Types.ObjectId,
            ref: "Proposal",
            required: true,
        },

        previousVersion: {
            type: Schema.Types.ObjectId,
            ref: "ProposalVersion",
            required: true,
        },

        latestVersion: {
            type: Schema.Types.ObjectId,
            ref: "ProposalVersion",
            required: true,
        },

        lecturer: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        aiReviewText: {
            type: String,
            required: true,
        },

        suggestedDecision: {
            type: String,
            enum: ["APPROVED", "CHANGES_REQUESTED", "REJECTED", "UNKNOWN"],
            default: "UNKNOWN",
        },

        confidenceLevel: {
            type: String,
            enum: ["HIGH", "MEDIUM", "LOW", "UNKNOWN"],
            default: "UNKNOWN",
        },
    },
    {
        timestamps: true,
    }
);

const ProposalAIReview = mongoose.model<IProposalAIReview>(
    "ProposalAIReview",
    proposalAIReviewSchema
);

export default ProposalAIReview;