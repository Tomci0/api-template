import { Request, Response, Router } from "express";
import { HttpMethod, Route, RouteGroup } from "../types/route";

import auth from "../middlewares/auth";

import portfolioController from "../controllers/portfolioController";

const router = Router();

export default {
    baseUrl: "/portfolio",
    router: router,
    middlewares: [],
    routes: [
        {
            path: "/",
            method: HttpMethod.GET,
            handler: portfolioController.index,
            middlewares: [],
        },
        {
            path: "/getCategories",
            method: HttpMethod.GET,
            handler: portfolioController.getCategories,
            middlewares: [],
        },

        {
            path: "/addCategory",
            method: HttpMethod.POST,
            handler: portfolioController.add_category,
            middlewares: [auth.authToken],
        },
        {
            path: "/removeCategory",
            method: HttpMethod.POST,
            handler: portfolioController.remove_category,
            middlewares: [auth.authToken],
        },

        {
            path: "/getProjects",
            method: HttpMethod.GET,
            handler: portfolioController.get_projects,
            middlewares: [auth.authToken],
        },
        {
            path: "/addProject",
            method: HttpMethod.POST,
            handler: portfolioController.add_project,
            middlewares: [auth.authToken],
        },
    ],
} as RouteGroup;
