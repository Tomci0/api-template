import jwt from "jsonwebtoken";

import UserModel from "../models/User";
import { createHmac, randomBytes } from "crypto";
import { isDevelopment } from "./dev";

export function generateAccessToken(userId: string, tokenVersion: number) {
    const payload = {
        userId,
        tokenVersion,
    };
    return jwt.sign(payload, process.env.JWT_SECRET as string, {
        expiresIn: isDevelopment() ? "1h" : "15m",
        algorithm: "HS256",
    });
}

export function generateRefreshToken(userId: string) {
    const randomPart = randomBytes(24).toString("hex");
    const hashPart = createHmac("sha256", process.env.JWT_SECRET as string)
        .update(`${randomPart}:${userId}`)
        .digest("hex")
        .substring(0, 32); // Ensure the hash is 32 characters long
    const encodedUserId = Buffer.from(userId).toString("base64");
    return `${hashPart}:${encodedUserId}`;
}

export default {
    generateAccessToken,
    generateRefreshToken,
};
