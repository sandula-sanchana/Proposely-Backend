import { Response, NextFunction } from "express";
import { AuthRequest } from "./authMiddleware";

export const roleMiddleware = (...allowedRoles: string[]) => {

    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({
                message: "Unauthorized user",
            });
        }

        console.log("REQ USER:", req.user);
        console.log("USER ROLE:", req.user.role);
        console.log("ALLOWED ROLES:", allowedRoles);

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: "Forbidden. You do not have permission",
            });
        }

        next();
    };
};