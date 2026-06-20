import { Response } from "express";
import User from "../models/userModel";
import { AuthRequest } from "../middleware/authMiddleware";

export const getAllLecturers = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const lecturers = await User.find({
            role: "LECTURER",
        }).select("-password");

        return res.status(200).json({
            message: "Lecturers fetched successfully",
            data: lecturers,
        });
    } catch (error: any) {
        console.log("GET LECTURERS ERROR:", error.message);

        return res.status(500).json({
            message: "Failed to fetch lecturers",
            error: error.message,
        });
    }
};