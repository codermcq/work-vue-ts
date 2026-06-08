# 工单管理系统 Demo

基于 **Vue 3 + TypeScript + Element Plus + ECharts** 的工单管理与图表展示 SPA 演示项目。

## ✨ 功能概览

| 功能 | 说明 |
|------|------|
| 🔐 模拟登录 | admin→管理员 / 其他→普通用户，表单校验 + 路由守卫 |
| 📋 工单表格 | 服务端分页（Mock API），Overtime Tag 颜色区分，Hours 列排序 |
| 📊 柱状图 | 按项目聚合工时，独立分页，柱顶数值标签，自适应容器 |
| 🗑️ 删除联动 | 管理员专属，Popconfirm 确认，表格+图表同步刷新，空页自动回退 |
| 🔄 顶栏操作 | 刷新按钮重新加载当前页，退出登录清除状态 |
| 🎭 空状态 | 无数据时表格和图表均显示 ElEmpty 占位 |
| ⏳ Loading | 表格和图表加载中显示 loading 动画 |

## 🛠 技术栈

| 类别 | 选型 |
|------|------|
| 框架 | Vue 3 (Composition API + `<script setup>`) |
| 语言 | TypeScript |
| UI 组件 | Element Plus |
| 图表 | ECharts |
| HTTP | Axios |
| 状态管理 | Pinia |
| 路由 | Vue Router 4 |
| 构建 | Vite |
| Mock | Vite `configureServer` 中间件 |

## 📁 项目结构

```
src/
├── main.ts                     # 入口：挂载 App、注册插件
├── App.vue                     # 根组件 <router-view />
├── styles/index.css            # 全局样式
├── types/index.ts              # 统一类型（WorkOrder、ApiResponse 等）
├── mock/server.ts              # Vite Mock 中间件（3 个 API + 400ms 延迟）
├── api/
│   ├── request.ts              # Axios 实例 + 拦截器
│   ├── auth.ts                 # POST /api/login
│   └── orders.ts               # GET /api/orders、DELETE /api/orders/:id
├── stores/auth.ts              # Pinia 用户状态（sessionStorage 持久化）
├── router/
│   ├── index.ts                # 路由配置（/login + /dashboard）
│   └── guards.ts               # beforeEach 守卫
├── views/
│   ├── LoginPage.vue           # 登录页（默认 admin/123456）
│   └── DashboardPage.vue       # 主页面（顶栏 + 表格 + 图表）
├── components/
│   └── ProjectChart.vue        # ECharts 柱状图组件
└── vite-env.d.ts
```

## 🚀 快速启动

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

启动后访问 **http://localhost:3000**

### 测试账户

| 用户名 | 密码 | 角色 | 权限 |
|--------|------|------|------|
| `admin` | `123456` | 管理员 | 查看 + **删除** |
| 任意其他 | 任意 | 普通用户 | 仅查看 |

## 📡 Mock API

Mock 服务通过 Vite 中间件拦截 `/api/*` 请求，在浏览器 Network 面板中完全可见。

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/login` | POST | 登录（username=admin → 管理员） |
| `/api/orders?page=1&pageSize=3` | GET | 分页查询工单 |
| `/api/orders/:id` | DELETE | 删除工单 |

所有接口统一响应格式 `{ code, message, data }`，模拟 400ms 网络延迟。

## 📄 页面说明

### 登录页

- 居中卡片布局，渐变背景
- 默认填充 `admin` / `123456`
- 表单校验：用户名和密码均为必填
- 登录后跳转 `/dashboard`

### Dashboard 页

- **顶栏**：标题 + 用户名/角色标签 + 刷新 + 退出登录
- **工单表格**：服务端分页，Overtime 列 Yes(红)/No(绿)，Delete 仅管理员可见
- **柱状图**：按项目聚合工时，独立分页，`#1890ff` 圆角柱子，顶部数值标签
- **路由守卫**：未登录 → `/login`，已登录访问 `/login` → `/dashboard`

## ✅ 验收清单

- [x] admin 登录 → 管理员；其他 → 普通用户；空值校验
- [x] 路由守卫：未登录 → /login；已登录 → /dashboard
- [x] 表格 5 列正确展示，Overtime Tag 颜色
- [x] 翻页 Network 可见，页容量 2/3/5/10 切换
- [x] admin 可见 Delete，user 不可见
- [x] Popconfirm 删除确认
- [x] 删除后表格+图表同步更新，空页自动回退
- [x] 图表按 Project 聚合 Hours，柱顶数值标签
- [x] 图表独立分页，Network 可见
- [x] X 轴水平标签，柱子 #1890ff 圆角
- [x] 空状态 + Loading 动画
- [x] 刷新 + 退出登录

## 📝 License

MIT
