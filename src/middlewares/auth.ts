import { NextFunction, Request, Response } from "express";
import ErrorResponse from "../classess/ErrorResponse";

import jwt from "jsonwebtoken";
import UserModel from "../models/User";
import { Token, User } from "../types/user";
import { TokenPayload } from "../types/token";
import { ErrorCodes } from "../types/ErrorCodes";

declare global {
    namespace Express {
        interface Request {
            user?: User;
        }
    }
}

export async function authToken(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];

    if (!token) {
        return new ErrorResponse(401, "Unauthorized", {
            message: "No token provided",
        }).send(res);
    }

    try {
        const tokenData: TokenPayload = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        ) as TokenPayload;
        if (!tokenData) {
            return new ErrorResponse(401, "Unauthorized", {
                message: "Invalid token",
            }).send(res);
        }

        const user = await UserModel.findById(tokenData.userId);

        if (!user) {
            return new ErrorResponse(401, "Unauthorized", {
                message: "User not found",
                code: ErrorCodes.UNAUTHORIZED,
            }).send(res);
        }

        if (user.tokenVersion !== tokenData.tokenVersion) {
            return new ErrorResponse(401, "Unauthorized", {
                message: "Token version mismatch",
                code: ErrorCodes.EXPIRED_TOKEN,
            }).send(res);
        }

        req.user = user;
        next();
    } catch (error: any) {
        if (error.message == "jwt expired") {
            return new ErrorResponse(401, "Unauthorized", {
                message: "Token expired",
                code: ErrorCodes.EXPIRED_TOKEN,
            }).send(res);
        }

        return new ErrorResponse(401, "Unauthorized", {
            message: "Token verification failed",
            code: ErrorCodes.FORBIDDEN,
        }).send(res);
    }
}

export async function checkPermission(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const user = req.user;

    if (!user) {
        return new ErrorResponse(401, "Unauthorized", {
            message: "User not found",
        }).send(res);
    }

    if (user.role !== "admin") {
        return new ErrorResponse(403, "Forbidden", {
            message: "You do not have permission to access this resource",
        }).send(res);
    }

    next();
}

export default {
    authToken,
    checkPermission,
};
