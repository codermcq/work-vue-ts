# 💼 前端开发测试任务说明文档（Vue3 版）

**项目名称：工单管理与图表展示页面（简化版）**
**技术栈：Vue 3 + TypeScript + Element Plus + ECharts + Axios**
**建议完成时间：2 小时以内**

---

## 📌 项目目标

本任务用于评估你是否具备以下能力：

- 使用 Vue 3 Composition API 开发交互页面的能力；
- 利用 AI 工具辅助开发的能力（如 ChatGPT / Cursor / Copilot）；
- 理解和实现交互逻辑（表格 + 图表联动）；
- 工程基础与代码表达清晰度。

---

## 🛠 技术栈要求

- 框架：Vue 3（Composition API + `<script setup>`）
- 语言：TypeScript
- UI 组件库：Element Plus
- 图表库：ECharts（推荐 vue-echarts 或 echarts 原生绑定）
- HTTP 客户端：Axios
- 构建工具：Vite

---

## 🎨 页面原型图

请参考如下页面原型完成界面结构设计与功能实现：
（此处插入原型图）

---

## 📄 页面功能说明

### 1️⃣ 登录页（模拟权限控制）

- 表单字段：用户名 / 密码（任意值）
- 登录逻辑：
  - 用户名为 `"admin"` → 管理员权限（role: 'admin'）
  - 其他用户名 → 普通用户权限（role: 'user'）
- 登录后跳转主页面（主页面路径：`/dashboard`）
- 无需 token 存储或刷新逻辑，只需在全局状态中保存当前用户信息
- 已登录状态下访问 `/login` 应自动重定向到 `/dashboard`
- 未登录状态下访问任何其他路径应重定向到 `/login`
- 表单默认填充用户名 `admin` 和密码 `123456`，方便测试
- 表单校验：用户名和密码均为必填项

### 2️⃣ 工单列表展示（服务端分页）

使用 Element Plus 的 `ElTable` 组件展示工单数据，字段如下：

| 字段名     | 示例值           | 说明                  |
| ---------- | ---------------- | --------------------- |
| ID         | 001              | 工单编号              |
| Project    | Road Project A   | 项目名称              |
| Overtime   | Yes / No         | 是否超时，用 Tag 区分颜色 |
| Hours      | 4.0              | 工时数，支持列排序     |
| Created At | 2024-04-11 10:00 | 创建时间              |

- 初始化 5 条 mock 数据（数据样本见末尾）
- **分页查询要求：**
  - 表格采用服务端分页模式（非前端全量分页）
  - 每次翻页通过 Axios 发送 HTTP 请求到 `/api/orders?page=X&pageSize=Y`
  - 请求应在浏览器 Network 面板中可见
  - Mock 服务端需从请求参数中解析 `page` 和 `pageSize`，返回 `{ list, total, page, pageSize }` 结构
  - 分页器显示总条数，支持切换每页条数（可选 2 / 3 / 5 / 10 条）
  - 表格 loading 状态下显示加载动画
- 每行有「Delete」按钮，**仅管理员（role === 'admin'）可见**
- 删除操作需弹出确认对话框（Popconfirm 或 ElMessageBox.confirm）
- 删除后本地从表格移除该行，同时同步更新图表数据
- 删除后若当前页数据为空且不是第一页，自动跳转到上一页

### 3️⃣ 图表展示（柱状图 + 独立分页）

- 标题：`Project Hours Distribution`
- 内容：按项目名称（Project）分组，统计累计工时（Hours）
- 示例：
  - Project A：6 小时
  - Project B：4 小时
- 使用 ECharts 柱状图（Bar Chart）
- 每根柱子顶部显示具体工时数值（label）
- 柱子颜色统一（建议 #1890ff），顶部圆角
- **图表独立分页要求：**
  - 图表拥有独立的分页状态，与表格分页互不影响
  - 图表的 Card 区域右上角放置独立的 Pagination 分页组件
  - 图表分页切换时同样通过 Axios 发送 HTTP 请求到 `/api/orders?page=X&pageSize=Y`
  - 请求在 Network 面板中可见
  - 图表聚合当前页返回的工单数据，按项目名称分组展示柱状图
  - 图表下方显示当前页摘要信息（如"当前页 3 条工单 · 共 5 条"）
  - 图表 loading 状态下显示加载动画
- X 轴标签文字水平显示，不倾斜；柱子与刻度标签居中对齐
- 无数据时显示空状态提示

### 4️⃣ 权限控制逻辑

| 功能         | 管理员（admin） | 普通用户 |
| ------------ | --------------- | -------- |
| 查看工单表格 | ✅              | ✅       |
| 删除工单     | ✅              | ❌       |
| 查看图表     | ✅              | ✅       |

### 5️⃣ 顶栏功能

- 左侧显示页面标题"工单管理" + 当前用户名和角色标签
- 右侧「刷新」按钮：重新请求表格和图表当前页数据
- 右侧「退出登录」按钮：清除用户状态，跳转到登录页

---

## 🏗️ Mock 服务端要求

**核心要求：使用 Vite 开发服务器的中间件（configureServer）来拦截 API 请求，让 Axios 发出真实的 HTTP 请求，在浏览器 Network 面板中完全可见。**

### API 接口规范

#### POST /api/login
- 请求体：`{ username: string, password: string }`
- 响应：`{ code: 0, message: 'ok', data: { username: string, role: 'admin' | 'user' } }`
- 逻辑：username === 'admin' → admin，其余 → user

#### GET /api/orders?page=1&pageSize=3
- 查询参数：`page`（页码，默认 1）、`pageSize`（每页条数，默认等于总条数）
- 响应：`{ code: 0, message: 'ok', data: { list: WorkOrder[], total: number, page: number, pageSize: number } }`
- 逻辑：服务端内存中维护一份工单数组，按 page/pageSize 切片返回

#### DELETE /api/orders/:id
- 路径参数：`id`（工单 ID）
- 响应：`{ code: 0, message: 'ok', data: null }`
- 逻辑：从内存数组中移除该条记录（逻辑删除）

### Mock 数据初始值

```json
[
  { "id": "001", "project": "Road Project A",       "overtime": true,  "hours": 3.5, "created_at": "2024-04-10 10:30" },
  { "id": "002", "project": "Bridge Maintenance B",  "overtime": false, "hours": 2,   "created_at": "2024-04-09 13:00" },
  { "id": "003", "project": "Pipeline Fix C",        "overtime": true,  "hours": 4.5, "created_at": "2024-04-08 08:00" },
  { "id": "004", "project": "Bridge Maintenance B",  "overtime": true,  "hours": 3,   "created_at": "2024-04-07 16:45" },
  { "id": "005", "project": "Tunnel Cleaning D",     "overtime": false, "hours": 8.1, "created_at": "2024-04-03 11:43" }
]
```

### Mock 响应规范

- 所有接口统一响应格式：`{ code: number, message: string, data: T }`
- 所有接口模拟 400ms 网络延迟（setTimeout）
- 设置 CORS 响应头，处理 OPTIONS 预检请求
- 未匹配的路由返回 code 404

---

## 🗂️ 项目结构建议

```
src/
├── main.ts                      # 入口，挂载 App
├── App.vue                      # 根组件（router-view）
├── styles/
│   └── index.css                # 全局基础样式
├── types/
│   └── index.ts                 # TypeScript 类型定义
├── mock/
│   └── data.ts                  # 硬编码的初始工单数据
├── api/
│   ├── request.ts               # Axios 实例封装
│   ├── auth.ts                  # 登录 API
│   └── orders.ts                # 工单列表 / 删除 API
├── stores/
│   └── auth.ts                  # Pinia 用户状态管理（或 reactive 全局状态）
├── router/
│   ├── index.ts                 # Vue Router 实例 + 路由配置（RouteRecordRaw[]）
│   └── guards.ts                # 路由守卫（beforeEach）
├── views/
│   ├── LoginPage.vue            # 登录页
│   └── DashboardPage.vue        # 主页面（表格 + 图表）
├── components/
│   └── ProjectChart.vue         # ECharts 柱状图组件
└── vite-env.d.ts
```

---

## 📦 依赖清单

```json
{
  "vue": "^3",
  "vue-router": "^4",
  "pinia": "^2",
  "element-plus": "^2",
  "echarts": "^5",
  "vue-echarts": "^7",
  "axios": "^1"
}
```

---

## ✅ 功能验收清单

| 功能点 | 验收标准 |
|--------|----------|
| 登录 | admin 登录 → 管理员角色；其他用户名 → 普通用户；空值校验拦截 |
| 路由守卫 | 未登录访问 /dashboard → 跳转 /login；已登录访问 /login → 跳转 /dashboard |
| 表格展示 | 5 列正确展示，Overtime 列用 Tag 区分颜色 |
| 表格分页 | 翻页发起 Network 请求，切换每页条数正常，显示总条数 |
| 删除按钮 | admin 可见 Delete 列，普通用户不可见 |
| 删除确认 | 点击删除弹出确认框，确认后删除，取消不删除 |
| 删除联动 | 删除后表格和图表数据同步更新，当前页删空自动跳转上一页 |
| 图表聚合 | 按 Project 名称分组，Hours 累加合并，柱子顶部显示数值 |
| 图表分页 | 图表独立分页组件，翻页发起 Network 请求，聚合当前页数据 |
| 图表样式 | X 轴标签水平不倾斜，柱子与标签居中对齐 |
| 空状态 | 无数据时表格和图表显示空状态提示 |
| Mock 可见 | 所有 API 请求在浏览器 Network 面板中可查看到完整 Request/Response |
| 刷新 | 刷新按钮重新请求表格和图表当前页数据 |
| 退出 | 退出登录清除用户状态并跳转登录页 |
| loading | 表格和图表加载中显示 loading 动画 |

---

## 📊 模拟数据样本（用于初始化表格）

```json
[
  {
    "id": "001",
    "project": "Road Project A",
    "overtime": true,
    "hours": 3.5,
    "created_at": "2024-04-10 10:30"
  },
  {
    "id": "002",
    "project": "Bridge Maintenance B",
    "overtime": false,
    "hours": 2,
    "created_at": "2024-04-09 13:00"
  },
  {
    "id": "003",
    "project": "Pipeline Fix C",
    "overtime": true,
    "hours": 4.5,
    "created_at": "2024-04-08 08:00"
  },
  {
    "id": "004",
    "project": "Bridge Maintenance B",
    "overtime": true,
    "hours": 3,
    "created_at": "2024-04-07 16:45"
  },
  {
    "id": "005",
    "project": "Tunnel Cleaning D",
    "overtime": false,
    "hours": 8.1,
    "created_at": "2024-04-03 11:43"
  }
]
```

---

## 📝 提交要求

1. 项目代码（GitHub 仓库或打包 zip 文件）；
2. 一个可运行的在线预览地址（CodeSandbox / Vercel / Netlify）；
3. 一页说明文档（Markdown 或 PDF）：
   - 使用了哪些 AI 工具？
   - 哪些代码是 AI 辅助生成的？你做了哪些修改？
   - 项目中你最满意或最难处理的点是什么？

---

## 💡 温馨提示

- 本任务建议控制在 2 小时内完成；
- 欢迎在说明文档中提及你在开发中对 AI 工具的理解和使用方法。
