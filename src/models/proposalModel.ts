import mongoose, { Document, Schema } from "mongoose";

export type ProposalStatus =
    | "DRAFT"
    | "SUBMITTED"
    | "ASSIGNED"
    | "CHANGES_REQUESTED"
    | "APPROVED"
    | "REJECTED";

export interface IProposal extends Document {
    title: string;
    description: string;
    student: mongoose.Types.ObjectId;
    assignedLecturer?: mongoose.Types.ObjectId;
    status: ProposalStatus;
    latestVersion?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const proposalSchema = new Schema<IProposal>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            required: true,
            trim: true,
        },

        student: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        assignedLecturer: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },

        status: {
            type: String,
            enum: [
                "DRAFT",
                "SUBMITTED",
                "ASSIGNED",
                "CHANGES_REQUESTED",
                "APPROVED",
                "REJECTED",
            ],
            default: "DRAFT",
        },

        latestVersion: {
            type: Schema.Types.ObjectId,
            ref: "ProposalVersion",
        }
    },
    {
        timestamps: true,
    }
);

const Proposal = mongoose.model<IProposal>("Proposal", proposalSchema);

export default Proposal;