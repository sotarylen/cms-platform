"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeormConfig = void 0;
const typeorm_naming_strategies_1 = require("typeorm-naming-strategies");
const node_path_1 = require("node:path");
const typeormConfig = () => ({
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    username: process.env.DB_USER ?? 'cms',
    password: process.env.DB_PASS ?? 'cms',
    database: process.env.DB_NAME ?? 'cms',
    synchronize: false,
    logging: process.env.NODE_ENV === 'development',
    entities: [(0, node_path_1.join)(__dirname, '..', 'modules', '**', '*.entity.{ts,js}')],
    migrations: [(0, node_path_1.join)(__dirname, '..', 'migrations', '*.{ts,js}')],
    namingStrategy: new typeorm_naming_strategies_1.SnakeNamingStrategy(),
});
exports.typeormConfig = typeormConfig;
