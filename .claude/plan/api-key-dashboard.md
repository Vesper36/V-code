# 功能规划：API Key 中转额度可视化查询面板

**规划时间**：2026-02-07
**预估工作量**：45 任务点

---

## 1. 功能概述

### 1.1 目标
构建一个现代化的 Web 应用，用于管理和可视化 New API 中转服务的 API Key 使用情况，帮助用户实时监控额度、消费和调用统计。

### 1.2 范围

**包含**：
- API Key 管理（添加、删除、查看）
- 余额和额度查询
- 使用数据可视化（图表、统计卡片）
- Cookie 持久化登录
- 响应式设计（移动端 + 桌面端）
- 新手教程和文档

**不包含**：
- 用户注册/登录系统（单用户模式）
- API Key 的创建和修改（仅查询）
- 支付和充值功能
- 多语言支持（仅中文）

### 1.3 技术约束
- 必须支持快速部署（Vercel/Netlify）
- 前后端一体化架构
- 无需独立数据库（使用浏览器存储）
- 响应式设计，移动端优先
- 现代浏览器支持（Chrome/Safari/Firefox 最新版）

---

## 2. 技术栈选型

### 2.1 核心技术栈

| 技术层 | 选型 | 理由 |
|--------|------|------|
| **框架** | Next.js 14 (App Router) | 全栈框架，支持 SSR/SSG，Vercel 一键部署 |
| **UI 库** | React 18 | 生态成熟，组件化开发 |
| **样式方案** | Tailwind CSS + shadcn/ui | 快速开发，现代化设计系统 |
| **图表库** | Recharts | 轻量级，React 原生支持 |
| **状态管理** | Zustand | 轻量级，适合中小型项目 |
| **数据存储** | localStorage + Cookie | 无需后端数据库，快速部署 |
| **HTTP 客户端** | Fetch API | 原生支持，无需额外依赖 |
| **类型检查** | TypeScript | 类型安全，提升开发体验 |
| **部署平台** | Vercel | 零配置部署，自动 HTTPS |

### 2.2 开发工具

- **包管理器**：pnpm（速度快，节省空间）
- **代码规范**：ESLint + Prettier
- **Git Hooks**：Husky + lint-staged
- **图标库**：Lucide React

---

## 3. 项目结构设计

```
v-ai/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # 根布局
│   ├── page.tsx                 # 首页（Dashboard）
│   ├── login/
│   │   └── page.tsx            # 登录页
│   ├── keys/
│   │   └── page.tsx            # Key 管理页
│   ├── tutorial/
│   │   └── page.tsx            # 教程页
│   ├── settings/
│   │   └── page.tsx            # 设置页
│   └── api/
│       └── proxy/
│           └── route.ts        # New API 代理接口
├── components/
│   ├── ui/                      # shadcn/ui 基础组件
│   ├── dashboard/
│   │   ├── StatCard.tsx        # 统计卡片
│   │   ├── UsageTrendChart.tsx # 使用趋势图
│   │   ├── ModelDistribution.tsx # 模型分布图
│   │   └── QuickActions.tsx    # 快捷操作
│   ├── keys/
│   │   ├── KeyCard.tsx         # Key 卡片
│   │   ├── AddKeyDialog.tsx    # 添加 Key 对话框
│   │   └── KeyList.tsx         # Key 列表
│   ├── layout/
│   │   ├── Header.tsx          # 顶部导航
│   │   ├── Sidebar.tsx         # 侧边栏（桌面端）
│   │   └── MobileNav.tsx       # 底部导航（移动端）
│   └── tutorial/
│       └── TutorialSteps.tsx   # 教程步骤
├── lib/
│   ├── api/
│   │   └── newapi.ts           # New API 客户端
│   ├── store/
│   │   └── useStore.ts         # Zustand 状态管理
│   ├── utils/
│   │   ├── storage.ts          # 本地存储工具
│   │   ├── format.ts           # 格式化工具
│   │   └── validation.ts       # 验证工具
│   └── types/
│       └── index.ts            # TypeScript 类型定义
├── public/
│   ├── images/                  # 图片资源
│   └── docs/                    # 文档资源
├── styles/
│   └── globals.css             # 全局样式
├── .env.local                   # 环境变量
├── next.config.js              # Next.js 配置
├── tailwind.config.ts          # Tailwind 配置
├── tsconfig.json               # TypeScript 配置
└── package.json                # 项目依赖
```

---

## 4. WBS 任务分解

### 4.1 任务清单

#### 模块 A：项目初始化（6 任务点）

##### 任务 A.1：创建 Next.js 项目（2 点）
- 执行 `npx create-next-app@latest v-ai --typescript --tailwind --app`
- 验证项目启动：`pnpm dev`

##### 任务 A.2：安装核心依赖（2 点）
- 安装 UI 组件库、图表库、状态管理、工具库

##### 任务 A.3：配置 shadcn/ui（1 点）
- 初始化并安装基础组件

##### 任务 A.4：配置 Tailwind 主题（1 点）
- 定义颜色变量、暗色模式、动画

---

#### 模块 B：类型定义和工具函数（5 任务点）

##### 任务 B.1：定义 TypeScript 类型（2 点）
- 定义 APIKey、UsageData、ModelStats、QuotaInfo 接口

##### 任务 B.2：实现存储工具（2 点）
- 实现 localStorage 和 Cookie 操作

##### 任务 B.3：实现格式化工具（1 点）
- 实现金额、数字、日期、Token 格式化

---

#### 模块 C：New API 对接（8 任务点）

##### 任务 C.1：研究 New API 接口（2 点）
- 查阅文档，确认接口和数据格式

##### 任务 C.2：实现 API 客户端（3 点）
- 创建 NewAPIClient 类，实现查询方法

##### 任务 C.3：实现代理接口（3 点）
- 创建 Next.js API Route

---

#### 模块 D：状态管理（4 任务点）

##### 任务 D.1：创建 Zustand Store（2 点）
- 定义全局状态和 Actions

##### 任务 D.2：实现数据缓存策略（2 点）
- 实现缓存过期检查和自动刷新

---

#### 模块 E：布局组件（6 任务点）

##### 任务 E.1：实现根布局（2 点）
##### 任务 E.2：实现顶部导航（2 点）
##### 任务 E.3：实现侧边栏和移动导航（2 点）

---

#### 模块 F：Dashboard 页面（10 任务点）

##### 任务 F.1：实现统计卡片组件（2 点）
##### 任务 F.2：实现使用趋势图（3 点）
##### 任务 F.3：实现模型分布图（2 点）
##### 任务 F.4：实现 Dashboard 页面（3 点）

---

#### 模块 G：Key 管理页面（6 任务点）

##### 任务 G.1：实现 Key 卡片组件（2 点）
##### 任务 G.2：实现添加 Key 对话框（2 点）
##### 任务 G.3：实现 Key 管理页面（2 点）

---

#### 模块 H：登录页面（3 任务点）

##### 任务 H.1：实现登录表单（2 点）
##### 任务 H.2：实现登录页面（1 点）

---

#### 模块 I：教程页面（3 任务点）

##### 任务 I.1：实现教程步骤组件（2 点）
##### 任务 I.2：实现教程页面（1 点）

---

#### 模块 J：部署和优化（4 任务点）

##### 任务 J.1：性能优化（2 点）
##### 任务 J.2：Vercel 部署（2 点）

---

## 5. New API 对接方案

### 5.1 API 端点（待确认）

| 功能 | 端点 | 方法 | 说明 |
|------|------|------|------|
| 余额查询 | `/api/user/quota` | GET | 查询当前余额和限额 |
| 使用统计 | `/api/user/usage` | GET | 查询使用历史（支持日期范围） |
| 模型统计 | `/api/user/models` | GET | 查询各模型调用统计 |

**请求头**：
```
Authorization: Bearer {API_KEY}
Content-Type: application/json
```

### 5.2 数据格式（示例）

**余额查询响应**：
```json
{
  "success": true,
  "data": {
    "total_quota": 100.00,
    "used_quota": 35.50,
    "remaining_quota": 64.50,
    "quota_type": "daily"
  }
}
```

**使用统计响应**：
```json
{
  "success": true,
  "data": [
    {
      "date": "2026-02-07",
      "total_calls": 150,
      "total_tokens": 45000,
      "total_cost": 2.50,
      "cache_hits": 30
    }
  ]
}
```

---

## 6. 部署方案

### 6.1 快速部署步骤

1. 推送代码到 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量（如需要）
4. 自动部署完成

### 6.2 环境变量

```
NEXT_PUBLIC_API_BASE_URL=https://your-newapi-domain.com
```

---

## 7. 开发优先级

**第一阶段（MVP）**：
- 模块 A（项目初始化）
- 模块 B（类型和工具）
- 模块 C（API 对接）
- 模块 D（状态管理）
- 模块 E（布局）
- 模块 F（Dashboard）
- 模块 G（Key 管理）

**第二阶段（完善）**：
- 模块 H（登录）
- 模块 I（教程）
- 模块 J（优化部署）
