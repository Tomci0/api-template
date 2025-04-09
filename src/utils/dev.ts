export function isDevelopment(): boolean {
    return process.env.VERSION === "dev";
}

export function isProduction(): boolean {
    return process.env.VERSION === "prod";
}

export default {
    isDevelopment,
    isProduction,
};
