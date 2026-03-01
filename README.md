# API Key Dashboard

一个现代化的 API Key 中转额度可视化查询面板，用于管理和监控 New API 中转服务的使用情况。

## 功能特性

- **API Key 管理**：支持添加、删除、查看多个 API Key
- **数据可视化**：余额、限额、调用次数、Token 消耗、模型分布等
- **响应式设计**：完美适配移动端和桌面端
- **暗色模式**：支持浅色/深色/跟随系统主题
- **本地存储**：数据安全存储在浏览器本地
- **教程文档**：内置新手指南和常见问题

## 技术栈

- Next.js 16 + React 19 + TypeScript
- Tailwind CSS 4 + shadcn/ui
- Recharts + Zustand

## 快速开始

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建生产版本
pnpm build
pnpm start
```

访问 http://localhost:3000

## 部署到 Vercel

1. 推送代码到 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 自动部署完成

## 使用说明

1. **登录**：输入 API Key（以 `sk-` 开头）
2. **添加 Key**：在 Keys 页面添加多个 API Key
3. **查看数据**：在 Dashboard 查看使用统计和图表
4. **管理 Key**：监控限额、删除 Key

## License

MIT
