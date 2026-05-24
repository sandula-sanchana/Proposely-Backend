import mongoose, { Document, Schema } from "mongoose";

export interface IProposalVersion extends Document {
    proposal: mongoose.Types.ObjectId;
    versionNumber: number;
    content: string;
    contentHash: string;
    submittedBy: mongoose.Types.ObjectId;
    locked: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const proposalVersionSchema = new Schema<IProposalVersion>(
    {
        proposal: {
            type: Schema.Types.ObjectId,
            ref: "Proposal",
            required: true,
        },

        versionNumber: {
            type: Number,
            required: true,
        },

        content: {
            type: String,
            required: true,
        },

        contentHash: {
            type: String,
            required: true,
        },

        submittedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        locked: {
            type: Boolean,
            default: true,
        }
    },
    {
        timestamps: true,
    }
);

const ProposalVersion = mongoose.model<IProposalVersion>(
    "ProposalVersion",
    proposalVersionSchema
);

export default ProposalVersion;