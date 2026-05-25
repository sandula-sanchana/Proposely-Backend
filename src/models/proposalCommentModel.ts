import mongoose, { Document, Schema } from "mongoose";

export interface IProposalComment extends Document {
    proposal: mongoose.Types.ObjectId;
    proposalVersion: mongoose.Types.ObjectId;
    lecturer: mongoose.Types.ObjectId;
    commentText: string;


    selectedText?: string;
    startIndex?: number;
    endIndex?: number;

    resolved: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const proposalCommentSchema = new Schema<IProposalComment>(
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

        commentText: {
            type: String,
            required: true,
            trim: true,
        },

        selectedText: {
            type: String,
            trim: true,
        },

        startIndex: {
            type: Number,
        },

        endIndex: {
            type: Number,
        },

        resolved: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const ProposalComment = mongoose.model<IProposalComment>(
    "ProposalComment",
    proposalCommentSchema
);

export default ProposalComment;