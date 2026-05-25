import mongoose, { Document, Schema } from "mongoose";

export type ReviewDecision =
    | "APPROVED"
    | "REJECTED"
    | "CHANGES_REQUESTED";

export interface IProposalReview extends Document {
    proposal: mongoose.Types.ObjectId;
    proposalVersion: mongoose.Types.ObjectId;
    lecturer: mongoose.Types.ObjectId;
    decision: ReviewDecision;
    feedback: string;
    createdAt: Date;
    updatedAt: Date;
}

const proposalReviewSchema = new Schema<IProposalReview>(
    {
        proposal: {
            type: Schema.Types.ObjectId,
            ref: "Proposal",
            required: true,
        },
        proposalVersion: {
            type: Schema.Types.ObjectId,
            ref: "ProposalVersion",
            required: true,
        },
        lecturer: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        decision: {
            type: String,
            enum: ["APPROVED", "REJECTED", "CHANGES_REQUESTED"],
            required: true,
        },
        feedback: {
            type: String,
            required: true,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

const ProposalReview = mongoose.model<IProposalReview>(
    "ProposalReview",
    proposalReviewSchema
);

export default ProposalReview;