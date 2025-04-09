import { Request, Response as Res } from "express";
import Response from "../classess/Response";
import { User, UserRegister } from "../types/user";
import UserModel from "../models/User";
import ErrorResponse from "../classess/ErrorResponse";
import { isDevelopment } from "../utils/dev";
import { ErrorCodes } from "../types/ErrorCodes";
import { isValidEmail, isValidPassword } from "../validators/auth";

import bcrypt from "bcrypt";
import { safeUser } from "../utils/safeUser";
import { generateAccessToken, generateRefreshToken } from "../utils/auth";
import { access } from "fs";

export default {
    index: (req: Request, res: Res) => {
        new Response(200, "Welcome to the API").send(res);
    },

    test: (req: Request, res: Res) => {
        new Response(200, "Test endpoint").send(res);
    },

    login: async (req: Request, res: Res) => {
        const { mail, password } = req.body || {};

        if (!mail || !password) {
            return new ErrorResponse(400, "Missing password or mail.", {
                code: ErrorCodes.MISSING_FIELDS,
            }).send(res);
        }

        if (!isValidEmail(mail) || !isValidPassword(password)) {
            return new ErrorResponse(400, "Invalid email or password.", {
                code: ErrorCodes.INVALID_CREDENTIALS,
            }).send(res);
        }

        const user = await UserModel.findOne({
            mail,
        });

        if (!user) {
            return new ErrorResponse(401, "Invalid credentials.", {
                code: ErrorCodes.USER_NOT_FOUND,
            }).send(res);
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return new ErrorResponse(401, "Invalid credentials.", {
                code: ErrorCodes.INVALID_CREDENTIALS,
            }).send(res);
        }

        const refreshToken = generateRefreshToken(user._id);

        try {
            user.refreshToken = refreshToken;
            user.tokenVersion = (user.tokenVersion || 0) + 1;
            user.lastLogin = new Date();
            user.markModified("refreshToken");
            user.markModified("tokenVersion");
            user.markModified("lastLogin");
            await user.save();
        } catch (error: any) {
            console.error("Error saving refresh token:", error);
            return new ErrorResponse(
                500,
                "Internal Server Error. Please contact support.",
                {
                    code: ErrorCodes.DATABASE_ERROR,
                    error: isDevelopment() ? error.message : undefined,
                }
            ).send(res);
        }

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        });

        return new Response(200, "Login successful", {
            user: isDevelopment() ? safeUser(user) : null,
            accessToken: generateAccessToken(user._id, user.tokenVersion),
        }).send(res);
    },

    register: async (req: Request, res: Res) => {
        const { mail, password } = req.body || {};

        if (!mail || !password) {
            return new ErrorResponse(400, "Missing password or mail.", {
                code: ErrorCodes.MISSING_FIELDS,
            }).send(res);
        }

        if (!isValidEmail(mail) || !isValidPassword(password)) {
            return new ErrorResponse(400, "Invalid email or password.", {
                code: ErrorCodes.INVALID_CREDENTIALS,
            }).send(res);
        }

        const isUserExist = await UserModel.findOne({
            mail,
        });

        if (isUserExist) {
            return new ErrorResponse(400, "User already exists.", {
                code: ErrorCodes.USER_ALREADY_EXISTS,
            }).send(res);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser: UserRegister = {
            mail,
            password: hashedPassword,
        };

        const user = new UserModel(newUser);

        try {
            user.save();
            return new Response(
                201,
                "User created",
                isDevelopment() ? safeUser(user) : null
            ).send(res);
        } catch (error: any) {
            console.error("Error creating user:", error);
            return new ErrorResponse(
                500,
                "Internal Server Error. Please contact support.",
                {
                    code: ErrorCodes.DATABASE_ERROR,
                    error: isDevelopment() ? error.message : undefined,
                }
            ).send(res);
        }
    },

    logout: (req: Request, res: Res) => {
        new Response(200, "Logout endpoint", {
            message: "Logout endpoint",
        }).send(res);
    },

    refresh: async (req: Request, res: Res) => {
        const { refreshToken } = req.cookies;

        if (!refreshToken) {
            return new ErrorResponse(401, "Unauthorized", {
                code: ErrorCodes.UNAUTHORIZED,
                message: "No refresh token provided",
            }).send(res);
        }

        const user = await UserModel.findOne({ refreshToken });

        if (!user) {
            return new ErrorResponse(401, "Unauthorized", {
                code: ErrorCodes.UNAUTHORIZED,
                message: "Invalid refresh token",
            }).send(res);
        }

        try {
            user.tokenVersion = (user.tokenVersion || 0) + 1;
            user.refreshToken = generateRefreshToken(user._id);
            user.markModified("refreshToken");
            user.markModified("tokenVersion");
            user.markModified("lastLogin");

            await user.save();

            res.cookie("refreshToken", user.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            });
        } catch (error: any) {
            console.error("Error updating user:", error);
            return new ErrorResponse(
                500,
                "Internal Server Error. Please contact support.",
                {
                    code: ErrorCodes.DATABASE_ERROR,
                    error: isDevelopment() ? error.message : undefined,
                }
            ).send(res);
        }

        return new Response(200, "Refresh token", {
            accessToken: generateAccessToken(user._id, user.tokenVersion),
            user: safeUser(user),
        }).send(res);
    },
};
