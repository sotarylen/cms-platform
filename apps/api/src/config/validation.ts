import Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  PORT: Joi.number().default(4000),
  DB_HOST: Joi.string().default('localhost'),
  DB_PORT: Joi.number().default(5432),
  DB_USER: Joi.string().default('cms'),
  DB_PASS: Joi.string().allow('').default('cms'),
  DB_NAME: Joi.string().default('cms'),
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
  JWT_SECRET: Joi.string().min(10).default('change-me'),
  JWT_EXPIRES_IN: Joi.string().default('1h'),
  API_KEYS: Joi.string().allow(''),
  S3_ENDPOINT: Joi.string().default('http://localhost:9000'),
  S3_BUCKET: Joi.string().default('cms-media'),
  S3_ACCESS_KEY: Joi.string().default('cms'),
  S3_SECRET_KEY: Joi.string().default('cms'),
  S3_REGION: Joi.string().default('us-east-1'),
});
