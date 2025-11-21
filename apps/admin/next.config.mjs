import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables from .env.local
const envLocalPath = path.resolve(process.cwd(), '../../.env.local');
if (fs.existsSync(envLocalPath)) {
  const envConfig = dotenv.parse(fs.readFileSync(envLocalPath));
  Object.keys(envConfig).forEach(key => {
    process.env[key] = envConfig[key];
  });
}

const nextConfig = {
  reactStrictMode: true,
  env: {
    N8N_CHAPTER_FETCH_WEBHOOK_URL: process.env.N8N_CHAPTER_FETCH_WEBHOOK_URL,
    N8N_CHAPTER_FETCH_WEBHOOK_URL_XCHINA: process.env.N8N_CHAPTER_FETCH_WEBHOOK_URL_XCHINA,
    N8N_CHAPTER_FETCH_WEBHOOK_URL_BOOK18: process.env.N8N_CHAPTER_FETCH_WEBHOOK_URL_BOOK18,
  },
  typedRoutes: true,
  experimental: {
    // typedRoutes 已从 experimental 移出，直接在配置根目录使用
  },
  webpack: (config) => {
    config.externals.push({
      'mysql2': 'commonjs mysql2',
      'tls': 'commonjs tls',
      'net': 'commonjs net',
      'timers': 'commonjs timers',
      'events': 'commonjs events'
    });
    
    return config;
  },
};

export default nextConfig;