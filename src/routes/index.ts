import { Request, Response, Router } from "express";
import { HttpMethod, Route, RouteGroup } from "../types/route";

import indexController from "../controllers/indexController";

const router = Router();

export default {
    baseUrl: "/",
    router: router,
    middlewares: [],
    routes: [
        {
            path: "/",
            method: HttpMethod.GET,
            handler: indexController.index,
            middlewares: [],
        },
    ],
} as RouteGroup;
