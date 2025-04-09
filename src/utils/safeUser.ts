import { SafeUser, User } from "../types/user";

export function safeUser(user: User): SafeUser {
    return {
        _id: user._id,
        mail: user.mail,
        lastLogin: user.lastLogin,
        role: user.role,
        createdAt: user.createdAt,
        twoFactorEnabled: user.twoFactorEnabled,
    };
}
