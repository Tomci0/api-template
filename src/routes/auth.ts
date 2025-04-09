import { Request, Response, Router } from "express";
import { HttpMethod, Route, RouteGroup } from "../types/route";

import authController from "../controllers/authController";

import { authToken } from "../middlewares/auth";

const router = Router();

export default {
    baseUrl: "/auth",
    router: router,
    middlewares: [],
    routes: [
        {
            path: "/",
            method: HttpMethod.GET,
            handler: authController.index,
            middlewares: [],
        },
        {
            path: "/test",
            method: HttpMethod.GET,
            handler: authController.test,
            middlewares: [authToken],
        },
        {
            path: "/login",
            method: HttpMethod.POST,
            handler: authController.login,
            middlewares: [],
        },
        {
            path: "/register",
            method: HttpMethod.POST,
            handler: authController.register,
            middlewares: [],
        },
        {
            path: "logout",
            method: HttpMethod.POST,
            handler: authController.logout,
            middlewares: [authToken],
        },
        {
            path: "/refresh",
            method: HttpMethod.POST,
            handler: authController.refresh,
        },
    ],
} as RouteGroup;
