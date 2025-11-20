import { fileURLToPath } from 'url';

const nextConfig = {
  reactStrictMode: true,
  env: {},
  typedRoutes: true,
  experimental: {
    // typedRoutes 已从 experimental 移出，直接在配置根目录使用
  },
  webpack: (config) => {
    config.externals.push({
      'mysql2': 'commonjs mysql2',
    });
    
    return config;
  },
};

export default nextConfig;