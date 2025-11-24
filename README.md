# Headless CMS Platform

一个面向企业级场景的现代化 Headless CMS，采用前后端分离、模块化与可插拔的架构。该项目包含以下关键部分：

- **apps/api**：基于 NestJS + TypeORM 的 GraphQL/REST API，支持内容模型、工作流、权限、多语言、多租户等核心能力。
- **apps/admin**：基于 Next.js + React 的可视化后台，现已内置“小说数据面板”，可直接连接 `n8n` 数据库浏览书籍、章节与摘要。
- **packages/core**：共享的 TypeScript SDK、类型定义、常量和工具方法。
- **infrastructure**：本地与生产环境的基础设施脚本（Docker Compose、Helm Chart、GitHub Actions 等）。

> 当前仓库为从零开始的初始实现，用于演示整体架构、约定和部分 MVP 功能。后续可按模块逐步扩展。

## 快速开始

```bash
# 1. 安装 pnpm（版本 >= 8）
# 2. 安装依赖
pnpm install

# 3. 启动本地开发服务（API + Admin）
pnpm dev
```

## 技术栈概览

- **前端**：Next.js 15、React 18、原子化 CSS（自定义），SWR-less 纯服务端渲染
- **后端**：NestJS 10、TypeORM、PostgreSQL、Redis、GraphQL、BullMQ
- **数据接入**：Next.js 服务器组件通过 `mysql2` 连接 MariaDB（n8n 库只读）
- **基础设施**：Docker Compose、Helm、GitHub Actions、OpenTelemetry、Traefik

## 小说数据面板

`apps/admin` 现默认作为“小说阅读与策划”界面，使用方式：

1. 在仓库根目录创建 `.env.local`（或在 shell 中导出同名变量），至少包含：

   ```
   N8N_DB_HOST=127.0.0.1
   N8N_DB_PORT=3306
   N8N_DB_USER=root
   N8N_DB_PASS=
   N8N_DB_NAME=n8n
   ```

2. 确保 Docker 中的 MariaDB 容器已运行且对外暴露 3306。
3. 执行 `pnpm --filter admin dev`（或 `pnpm dev` 启动整套服务），浏览器访问 `http://localhost:3001`（避免占用已在用的 3000 端口）。
4. 通过搜索、状态筛选、章节分页、阶段摘要、改编脚本等模块获取书籍信息。所有查询均为只读，不会修改数据库。

## 模块里程碑

1. ✅ 项目骨架和核心依赖
2. 🚧 内容模型、工作流、权限、媒体的领域模块
3. 🔜 搜索、插件市场、自动化与审计
4. 🔜 完整 DevOps（CI/CD、监控、日志）

更多细节见 `docs/` 与各子模块 README。
