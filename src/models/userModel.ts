import mongoose,{Document,Schema} from "mongoose";

export type UserRole = "ADMIN" | "STUDENT" | "LECTURER"

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
    name : {
        type: String,
        required: true,
        trim: true,

    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["ADMIN", "STUDENT", "LECTURER"],
        default: 'STUDENT'

    }
},{ timestamps: true });

const User=mongoose.model<IUser>("User",UserSchema);

export default User;