"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => ({
    app: {
        name: process.env.APP_NAME ?? 'cms-api',
        env: process.env.NODE_ENV ?? 'development',
        port: Number(process.env.PORT ?? 4000),
        globalPrefix: 'api',
    },
    database: {
        host: process.env.DB_HOST ?? 'localhost',
        port: Number(process.env.DB_PORT ?? 5432),
        username: process.env.DB_USER ?? 'cms',
        password: process.env.DB_PASS ?? 'cms',
        name: process.env.DB_NAME ?? 'cms',
    },
    redis: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: Number(process.env.REDIS_PORT ?? 6379),
    },
    auth: {
        jwtSecret: process.env.JWT_SECRET ?? 'change-me',
        jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1h',
        apiKeys: process.env.API_KEYS?.split(',').map((key) => key.trim()).filter(Boolean) ?? [],
    },
    objectStore: {
        endpoint: process.env.S3_ENDPOINT ?? 'http://localhost:9000',
        bucket: process.env.S3_BUCKET ?? 'cms-media',
        accessKey: process.env.S3_ACCESS_KEY ?? 'cms',
        secretKey: process.env.S3_SECRET_KEY ?? 'cms',
        region: process.env.S3_REGION ?? 'us-east-1',
    },
});
