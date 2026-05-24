import { Request, Response, NextFunction } from 'express';
import {AuthRequest} from "./authMiddleware";


export const roleMiddleware = (...allowedRoles: string[])=>{

    return async (req: AuthRequest, res: Response, next: NextFunction) => {


        if (!req?.user){
            return res.status(401).json({
                message: "Unauthorized user",
            })
        }

        if (!allowedRoles.includes(req?.user.roles)){
            return res.status(401).json({
                message: "Forbidden. You do not have permission",
            })
        }

        next();

    }

}