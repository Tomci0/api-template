import mongoose from "mongoose";
import dotenv from "dotenv";
import chalk from "chalk";
import figlet from "figlet";
import os from "os";
import ip from "ip";
import { performance } from "perf_hooks";

import app from "./app";

import {
    runningMessage,
    showTag,
    welcomeMessage,
    databaseMessage,
} from "./utils/tag";

dotenv.config();

process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
    process.exit(1);
});

if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is not defined");
    process.exit(1);
}

welcomeMessage();

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        databaseMessage(true);
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);
    });

const port = process.env.PORT || 8000;

const startTime = performance.now();

app.listen(port, () => {
    runningMessage(startTime);
});

process.on("unhandledRejection", (err) => {
    console.error("Unhandled Rejection:", err);
    process.exit(1);
});
