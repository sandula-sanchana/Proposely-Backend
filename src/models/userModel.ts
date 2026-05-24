import mongoose, { Document, Schema } from "mongoose";

export type UserRole = "ADMIN" | "STUDENT" | "LECTURER";
export type AuthProvider = "LOCAL" | "GOOGLE";

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    authProvider: AuthProvider;
    googleId?: string;
    profileImage?: string;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        password: {
            type: String,
            required: function () {
                return this.authProvider === "LOCAL";
            },
        },

        role: {
            type: String,
            enum: ["ADMIN", "STUDENT", "LECTURER"],
            default: "STUDENT",
        },

        authProvider: {
            type: String,
            enum: ["LOCAL", "GOOGLE"],
            default: "LOCAL",
        },

        googleId: {
            type: String,
        },

        profileImage: {
            type: String,
        }
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model<IUser>("User", userSchema);

export default User;