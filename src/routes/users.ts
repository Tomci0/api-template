import { Request, Response, Router } from "express";
import { HttpMethod, Route, RouteGroup } from "../types/route";

import usersController from "../controllers/usersController";
import { authToken } from "../middlewares/auth";

export default {
    baseUrl: "/users",
    router: Router(),
    middlewares: [],
    routes: [
        {
            path: "/",
            method: HttpMethod.GET,
            handler: usersController.index,
            middlewares: [],
        },
        {
            path: "/me",
            method: HttpMethod.GET,
            handler: usersController.me,
            middlewares: [authToken],
        },
    ],
} as RouteGroup;
