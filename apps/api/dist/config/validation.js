"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validationSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.validationSchema = joi_1.default.object({
    NODE_ENV: joi_1.default.string().valid('development', 'test', 'production').default('development'),
    PORT: joi_1.default.number().default(4000),
    DB_HOST: joi_1.default.string().default('localhost'),
    DB_PORT: joi_1.default.number().default(5432),
    DB_USER: joi_1.default.string().default('cms'),
    DB_PASS: joi_1.default.string().allow('').default('cms'),
    DB_NAME: joi_1.default.string().default('cms'),
    REDIS_HOST: joi_1.default.string().default('localhost'),
    REDIS_PORT: joi_1.default.number().default(6379),
    JWT_SECRET: joi_1.default.string().min(10).default('change-me'),
    JWT_EXPIRES_IN: joi_1.default.string().default('1h'),
    API_KEYS: joi_1.default.string().allow(''),
    S3_ENDPOINT: joi_1.default.string().default('http://localhost:9000'),
    S3_BUCKET: joi_1.default.string().default('cms-media'),
    S3_ACCESS_KEY: joi_1.default.string().default('cms'),
    S3_SECRET_KEY: joi_1.default.string().default('cms'),
    S3_REGION: joi_1.default.string().default('us-east-1'),
});
