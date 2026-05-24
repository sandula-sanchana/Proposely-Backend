import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';


export interface AuthRequest extends Request {
    user?:{
        id: string;
        email: string;
        roles: string;
    }
}

export const authMiddleware=(req: AuthRequest, res: Response, next: NextFunction) => {
    try {

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: 'Unauthorized , no token provided.',
            })
        }

        const token = authHeader.split('Bearer ')[1];

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET as string) as {
            id: string;
            email: string;
            roles: string;
        };

        req.user = decodedToken;

        next();



    }catch(err : any){

        return res.status(401).json({
            message: "Invalid or expired token",
            error: err.message ,
        });

    }
}