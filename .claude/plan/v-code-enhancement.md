# V-CODE 平台增强规划（8 项需求）

**规划时间**：2026-02-11
**项目根目录**：`/Users/vesper/workspace/project/v-ai`

---

## 1. 功能概述

### 1.1 目标

对 V-CODE 平台进行全面增强：管理员体验优化、客户端导航扩展、产品展示页、模型管理、API 文档汇总、API URL 迁移。

### 1.2 范围

**包含**：
- 管理员登录时长统一为 30 天
- 客户端导航新增产品展示入口
- `/showcase` 产品展示页
- `/models` 客户端模型状态页
- `/admin/models` 管理端模型管理页
- `/admin/api-docs` 管理端 API 文档汇总页
- API URL 迁移到 `api.v-cod.vesper36.top`
- 管理后台功能完整性审查

**不包含**：
- 用户注册/权限体系重构
- New API 后端本身的修改
- 国际化翻译全量覆盖（仅新增必要条目）

### 1.3 技术约束

- Next.js 16.1.6 + React 19 + Tailwind CSS 4
- shadcn/ui + lucide-react
- Prisma 7（driver adapter）
- 管理员认证：httpOnly cookie + globalThis session
- 部署：Docker -> HZUS VPS 端口 8888
- 风格：glass 毛玻璃 + backdrop-blur + container 布局

---

## 2. 任务分解（按优先级排序）

### P0 - 基础设施变更（先行）

#### 任务 1：API URL 迁移
- **优先级**：P0（阻塞其他功能测试）
- **文件变更**：
  - `.env.local` - 修改 `NEW_API_BASE_URL` 为 `https://api.v-cod.vesper36.top`
  - `app/api/proxy/route.ts:3` - fallback 默认值更新
  - `app/api/admin-proxy/route.ts:63` - fallback 默认值更新
  - `app/tutorial/page.tsx` - 示例代码中的 URL 更新
- **实现步骤**：
  1. 修改 `.env.local` 中 `NEW_API_BASE_URL=https://api.v-cod.vesper36.top`
  2. 更新 `proxy/route.ts` 第 3 行 fallback
  3. 更新 `admin-proxy/route.ts` 第 63 行 fallback
  4. 全局搜索 `v-api.vesper36.top`，更新所有引用
  5. 更新 tutorial 页面中的示例 URL
- **风险**：需确保 DNS 已解析 `api.v-cod.vesper36.top` 到正确服务器

#### 任务 2：管理员登录时长改为 30 天
- **优先级**：P0（简单改动，立即生效）
- **文件变更**：
  - `app/api/admin/auth/route.ts:50-51,64` - TTL 统一为 30 天
  - `app/admin/login/page.tsx`（如有 rememberMe 复选框则移除）
- **实现步骤**：
  1. `route.ts` 第 50 行：`const ttl = 30 * 24 * 60 * 60 * 1000;`（移除 rememberMe 三元）
  2. 第 64 行：`const maxAge = 30 * 24 * 60 * 60;`（统一 30 天）
  3. 检查前端登录页是否有 rememberMe 复选框，如有则移除

### P1 - 导航与页面扩展

#### 任务 3：客户端导航栏新增入口
- **文件变更**：
  - `components/layout/Header.tsx` - 右侧导航区新增"产品介绍"链接
  - `components/layout/Sidebar.tsx` - navItems 新增 showcase 和 models 入口
  - `lib/i18n/translations.ts` - 新增 nav.showcase / nav.models 翻译
- **实现步骤**：
  1. Header.tsx：在"文档"链接前新增 `/showcase` 链接（图标：Sparkles）
  2. Sidebar.tsx：navItems 数组新增 `{ href: '/showcase', label: '产品介绍', icon: Sparkles }` 和 `{ href: '/models', label: '模型状态', icon: Activity }`
  3. MobileNav 同步更新
  4. translations.ts 新增中英文条目

#### 任务 4：管理端导航新增入口
- **文件变更**：
  - `components/admin/AdminHeader.tsx` - navItems 新增模型管理和 API 文档
- **实现步骤**：
  1. navItems 数组新增：
     - `{ href: '/admin/models', label: '模型管理', icon: Bot }`（插入到渠道管理之后）
     - `{ href: '/admin/api-docs', label: 'API 文档', icon: FileCode }`（插入到系统日志之后）
  2. 导入新图标：`Bot, FileCode` from lucide-react

### P2 - 新页面开发

#### 任务 5：V-CODE 产品展示页 `/showcase`
- **新建文件**：`app/showcase/page.tsx`
- **页面结构**：
  1. Hero 区域 - 标题、副标题、CTA 按钮（跳转到 /tutorial）
  2. 功能特性 - 4-6 个特性卡片（多模型支持、高可用、低延迟、安全等）
  3. 支持模型列表 - 按厂商分类展示（OpenAI/Anthropic/Google 等）
  4. 定价方案 - 按量计费说明
  5. 接入方式 - 代码示例（复用 tutorial 的代码片段风格）
- **设计要点**：
  - 使用 glass 卡片风格
  - 渐变背景 + 动画效果
  - 响应式：移动端单列，桌面端多列网格
- **依赖**：无

#### 任务 6：客户端模型状态页 `/models`
- **新建文件**：`app/models/page.tsx`
- **数据来源**：`/api/proxy?path=/v1/models`（用户 API Key 认证）
- **页面结构**：
  1. 页面标题 + 模型总数统计
  2. 分类筛选栏（全部/GPT/Claude/Gemini/其他）
  3. 模型卡片网格 - 每个卡片显示：
     - 模型名称
     - 状态徽章（通过 ping 检测：在线/离线）
     - 模型厂商标识
     - 上下文窗口大小（如已知）
  4. 搜索框（按模型名过滤）
- **实现要点**：
  - 调用 `/v1/models` 获取模型列表
  - 按模型名前缀分类（gpt-* / claude-* / gemini-* 等）
  - 使用 Card + Badge 组件
  - 加载状态用 Skeleton
- **依赖**：用户需已登录（localStorage 有 api_key）

#### 任务 7：管理端模型管理页 `/admin/models`
- **新建文件**：`app/admin/models/page.tsx`
- **数据来源**：`/api/admin-proxy?path=/api/channel/` 和 `/api/admin-proxy?path=/api/model/`
- **页面结构**：
  1. 页面标题 + 操作栏（刷新、批量操作）
  2. 模型列表表格：
     - 模型名称
     - 所属渠道
     - 定价（输入/输出单价，单位：$/1M tokens）
     - 速率限制（RPM / TPM）
     - 输出参数（max_tokens 上限、temperature 范围）
     - 状态（启用/禁用）
     - 操作（编辑/禁用）
  3. 编辑弹窗（Dialog）：
     - 定价配置：输入单价、输出单价
     - 速率限制：RPM、TPM
     - 输出参数：max_tokens、temperature min/max、top_p
     - 启用/禁用开关
- **实现要点**：
  - 通过 admin-proxy 调用 New API 的渠道管理接口
  - 模型配置存储在渠道的 model_mapping 中
  - 使用 Table + Dialog + Form 组件
  - 支持搜索和分页
- **依赖**：管理员已登录

---

## 3. 依赖关系

```
任务1 (API URL) ──> 所有其他任务（测试依赖正确的 API 地址）
任务2 (登录时长) ──> 无依赖
任务3 (客户端导航) ──> 任务5, 任务6 需要导航入口
任务4 (管理端导航) ──> 任务7, 任务8 需要导航入口
任务5 (展示页) ──> 独立
任务6 (模型状态页) ──> 任务3 提供入口
任务7 (模型管理页) ──> 任务4 提供入口
任务8 (API文档页) ──> 任务4 提供入口
```

**推荐执行顺序**：1 -> 2 -> 3+4（并行） -> 5+6+7+8（并行）#### 任务 8：管理端 API 文档汇总页 `/admin/api-docs`
- **新建文件**：`app/admin/api-docs/page.tsx`
- **页面结构**：
  1. 页面标题 + 简介
  2. 按模块分类的 API 列表（Accordion 折叠面板）：
     - 用户管理 API（/api/user/*）
     - 密钥管理 API（/api/token/*）
     - 渠道管理 API（/api/channel/*）
     - 模型管理 API（/api/model/*）
     - 日志查询 API（/api/log/*）
     - 系统配置 API（/api/option/*）
  3. 每个接口条目显示：
     - HTTP 方法徽章（GET/POST/PUT/DELETE）
     - 路径
     - 简要说明
     - 展开后显示：参数表格、响应示例（JSON）
  4. 快速复制 cURL 命令按钮
- **实现要点**：
  - API 文档数据以静态 JSON 定义（`lib/data/api-docs.ts`）
  - 使用 Accordion + Table + Badge 组件
  - 方法徽章颜色：GET=蓝、POST=绿、PUT=橙、DELETE=红
  - 支持搜索过滤
- **依赖**：管理员已登录

---

## 4. 文件变更汇总

### 修改文件（8 个）
| 文件 | 变更类型 |
|------|---------|
| `.env.local` | 修改 API URL |
| `app/api/proxy/route.ts` | 修改 fallback URL |
| `app/api/admin-proxy/route.ts` | 修改 fallback URL |
| `app/api/admin/auth/route.ts` | 统一 TTL 为 30 天 |
| `components/layout/Header.tsx` | 新增展示页链接 |
| `components/layout/Sidebar.tsx` | 新增 showcase/models 入口 |
| `components/admin/AdminHeader.tsx` | 新增 models/api-docs 入口 |
| `lib/i18n/translations.ts` | 新增翻译条目 |

### 新建文件（5 个）
| 文件 | 说明 |
|------|------|
| `app/showcase/page.tsx` | 产品展示页 |
| `app/models/page.tsx` | 客户端模型状态页 |
| `app/admin/models/page.tsx` | 管理端模型管理页 |
| `app/admin/api-docs/page.tsx` | API 文档汇总页 |
| `lib/data/api-docs.ts` | API 文档静态数据 |

---

## 5. 风险与注意事项

1. **DNS 解析**：`api.v-cod.vesper36.top` 需提前配置 DNS，否则 API 调用全部失败
2. **New API 接口兼容性**：模型管理页依赖 `/api/channel/` 和 `/api/model/` 接口，需确认格式
3. **Session 丢失**：Docker 重启后 globalThis session 清空，管理员需重新登录
4. **模型状态检测**：`/v1/models` 只返回列表，无实时状态，以"已配置"为准
5. **API 文档维护**：静态定义需手动与 New API 后端保持同步

---

## 6. 验收标准

- [ ] 管理员登录后 cookie maxAge 为 30 天
- [ ] 客户端 Header/Sidebar 可见"产品介绍"和"模型状态"入口
- [ ] `/showcase` 页面包含 Hero/特性/模型/定价/接入 5 个区块
- [ ] `/models` 页面能加载模型列表，支持分类筛选和搜索
- [ ] `/admin/models` 页面能展示模型配置，支持编辑定价/速率/参数
- [ ] `/admin/api-docs` 页面按模块展示 API 文档，支持搜索
- [ ] 所有 API 请求指向 `api.v-cod.vesper36.top`
- [ ] `pnpm build` 编译通过
