import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/userModel";
import { generateAccessToken, generateRefreshToken } from "../utils/token";

export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required",
            });
        }

        const exUser = await User.findOne({ email });

        if (exUser) {
            return res.status(400).json({
                message: "User already exists",
            });
        }

        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || "STUDENT",
        });

        return res.status(201).json({
            message: "User registered successfully",
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error: any) {
        console.log("REGISTER ERROR:", error.message);

        return res.status(500).json({
            message: "Register failed",
            error: error.message,
        });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required",
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        return res.status(200).json({
            message: "Login successful",
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
                accessToken,
                refreshToken,
            },
        });
    } catch (error: any) {
        console.log("LOGIN ERROR:", error.message);

        return res.status(500).json({
            message: "Login failed",
            error: error.message,
        });
    }
};