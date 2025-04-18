import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import expressMongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";

import fs from "fs";
import path from "path";
import { Router } from "express";
import { LoadedRoute, RouteGroup } from "./types/route";
import { showRoutesTable } from "./utils/tag";

const app = express();
const validMethods = [
    "get",
    "post",
    "put",
    "delete",
    "patch",
    "options",
    "head",
    "all",
];

app.use(
    express.json({
        limit: "1mb",
    })
);

app.use(express.urlencoded({ extended: true }));

app.use(
    cors({
        origin: function (origin, callback) {
            // const allowedOrigins = [
            //     "http://localhost:3000",
            //     "https://designbyte.pl",
            // ];

            // if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
            // } else {
            //     callback(new Error("Not allowed by CORS"));
            // }
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
        preflightContinue: false,
        optionsSuccessStatus: 204,
    })
);

app.use(cookieParser());
app.use(helmet());

const limiter = rateLimit({
    max: 150,
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: {},
});
app.use(limiter);

app.use(hpp());

app.use(morgan("dev"));
// app.use(expressMongoSanitize());

// Routes

// add loading routes from ./routes directory

const loadedRoutes: LoadedRoute[] = [];

const loadRoutes = async (dir = "") => {
    const routesDir = path.join(__dirname, "routes");

    if (!fs.existsSync(routesDir)) {
        console.error("Routes directory does not exist");
        return;
    }
    const routeFiles = fs.readdirSync(routesDir).filter((file) => {
        return file.endsWith(".ts") && !file.endsWith(".d.ts");
    });

    for (const file of routeFiles) {
        try {
            const routePath = path.join(routesDir, file);
            const route = await import(routePath);
            const routeData: RouteGroup = route.default;

            const subRoutes = [];

            if (routeData.router instanceof Router) {
                if (routeData.middlewares && routeData.middlewares.length > 0) {
                    app.use(
                        routeData.baseUrl,
                        routeData.middlewares,
                        routeData.router
                    );
                } else {
                    app.use(routeData.baseUrl, routeData.router);
                }

                if (routeData.routes && routeData.routes.length > 0) {
                    for (const route of routeData.routes) {
                        if (route.middlewares && route.middlewares.length > 0) {
                            if (
                                validMethods.includes(
                                    route.method.toLowerCase()
                                )
                            ) {
                                routeData.router[route.method](
                                    route.path,
                                    route.middlewares,
                                    route.handler
                                );
                            }
                        } else {
                            routeData.router[route.method](
                                route.path,
                                route.handler
                            );
                        }

                        subRoutes.push({
                            url: route.path,
                            method: route.method,
                        });
                    }
                }

                loadedRoutes.push({
                    baseUrl: routeData.baseUrl,
                    routes: subRoutes,
                });
            } else {
                console.error(`Route ${file} is not a valid router`);
            }
        } catch (error) {
            console.error(`Error loading route ${file}:`, error);
        }
    }

    showRoutesTable(loadedRoutes);
};

loadRoutes();

export default app;
