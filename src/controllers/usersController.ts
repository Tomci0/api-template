import { Request, Response } from "express";
import { safeUser } from "../utils/safeUser";

export default {
    index: (req: any, res: any) => {
        console.log("123443w");
        res.status(200).json({
            message: "Welcome to the API 213",
        });
    },

    me: async (req: Request, res: Response) => {
        const user = req.user;

        if (!user) {
            return res.status(401).json({
                status: 401,
                message: "Unauthorized",
                data: null,
            });
        }

        res.status(200).json({
            status: 200,
            message: "User data",
            data: safeUser(user),
        });
    },
};
