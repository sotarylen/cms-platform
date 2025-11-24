import mysql from 'mysql2/promise';

declare global {
  // eslint-disable-next-line no-var
  var __n8nReaderPool: mysql.Pool | undefined;
}

const getEnv = (key: string, fallback?: string): string => {
  const value = process.env[key] ?? fallback;
  if (!value) {
    throw new Error(`缺少必要的环境变量：${key}`);
  }
  return value;
};

const buildPool = () =>
  mysql.createPool({
    host: getEnv('N8N_DB_HOST', 'mariadb'),
    port: Number(getEnv('N8N_DB_PORT', '3306')),
    user: getEnv('N8N_DB_USER', 'root'),
    password: getEnv('N8N_DB_PASS', 'rainmanlen'),
    database: getEnv('N8N_DB_NAME', 'n8n'),
    connectionLimit: 10,
    timezone: 'Z',
    charset: 'utf8mb4_general_ci',
    enableKeepAlive: true,
  });

export const getPool = () => {
  if (!globalThis.__n8nReaderPool) {
    globalThis.__n8nReaderPool = buildPool();
  }
  return globalThis.__n8nReaderPool;
};

export const query = async <T>(sql: string, params: unknown[] = []) => {
  const [rows] = await getPool().query(sql, params);
  return rows as T;
};

