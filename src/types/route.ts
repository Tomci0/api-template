import { Request, Response, NextFunction, Router } from "express";

export type MiddlewareFunction = (
    req: Request,
    res: Response,
    next: NextFunction
) => void;
export type HandlerFunction = (req: Request, res: Response) => void;

export enum HttpMethod {
    GET = "get",
    POST = "post",
    PUT = "put",
    DELETE = "delete",
    PATCH = "patch",
    OPTIONS = "options",
    HEAD = "head",
    ALL = "all",
}

export interface Route {
    path: string;
    method: HttpMethod;
    handler: HandlerFunction;
    middlewares?: MiddlewareFunction[];
}

export interface RouteGroup {
    baseUrl: string;
    router: Router;
    middlewares?: MiddlewareFunction[];
    routes: Route[];
}

export interface LoadedRoute {
    baseUrl: string;
    error?: boolean;
    routes: {
        url: string;
        method: string;
        error?: boolean;
    }[];
}
