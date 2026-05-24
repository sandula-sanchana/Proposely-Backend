import jwt from "jsonwebtoken";
import { IUser } from "../models/userModel";

export const generateAccessToken = (user: IUser) => {
    return jwt.sign(
        {
            id: user._id,
            email: user.email,
            role: user.role,
        },
        process.env.JWT_SECRET as string,
        {
            expiresIn: "7d",
        }
    );
};

export const generateRefreshToken = (user: IUser) => {
    return jwt.sign(
        {
            id: user._id,
            email: user.email,
        },
        process.env.JWT_REFRESH_SECRET as string,
        {
            expiresIn: "7d",
        }
    );
};