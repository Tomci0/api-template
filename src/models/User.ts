import mongoose from "mongoose";

import { Document, model, Schema } from "mongoose";

import { User, UserRole } from "../types/user";

const userSchema = new Schema<User>({
    mail: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    lastLogin: {
        type: Date,
        default: Date.now,
    },
    role: {
        type: String,
        enum: Object.values(UserRole),
        default: UserRole.MODERATOR,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },

    refreshToken: {
        type: String,
        default: null,
    },
    tokenVersion: {
        type: Number,
        default: 0,
    },

    twoFactorEnabled: {
        type: Boolean,
        default: false,
    },
    twoFactorSecret: {
        type: String,
        default: null,
    },
    twoFactorRecoveryCodes: {
        type: [String],
        default: null,
    },
});

const UserModel = model<User>("User", userSchema);

export default UserModel;
