import { Document } from "mongoose";

export interface User extends Document {
    _id: string;
    mail: string;
    password: string;
    lastLogin: Date;
    role: UserRole;
    createdAt: Date;
    refreshToken?: string;
    tokenVersion?: number;

    twoFactorEnabled?: boolean;
    twoFactorSecret?: string;
    twoFactorRecoveryCodes?: string[];
}

export interface SafeUser {
    _id: string;
    mail: string;
    lastLogin: Date;
    role: UserRole;
    createdAt: Date;

    twoFactorEnabled?: boolean;
}

export interface UserRegister {
    mail: string;
    password: string;
}

export interface Token {
    user: string | User;
    token: string;
    type: TokenType;
    expiresIn: number;
}

export enum TokenType {
    RESET_PASSWORD = "reset_password",
    EMAIL_VERIFICATION = "email_verification",
}

export enum UserRole {
    MODERATOR = "moderator",
    ADMIN = "admin",
}
