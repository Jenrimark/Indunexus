# 智链数科 (InduNexus) - 工业零部件智能采购平台

<div align="center">

**基于 AI 视觉与知识图谱的汽车零部件智能采购平台**

[![Vue 3](https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vue.js)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite)](https://vitejs.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![SQLite](https://img.shields.io/badge/SQLite-开发环境-003B57?logo=sqlite)](https://sqlite.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[快速开始](#-快速开始) • [功能特性](#-功能特性) • [技术架构](#-技术架构) • [数据模型](#-数据模型) • [API 接口](#-api-接口) • [贡献指南](#-贡献指南)

</div>

---

## 📖 项目简介

智链数科是一个专为汽车工业供应链打造的零部件智能采购平台，解决"非标 SKU 识别难、人货匹配效率低"的核心痛点。平台集成 AI 图像识别、知识图谱、供应链数据分析于一体，为采购人员提供从识别到决策的完整工作流。

### 核心价值

- 🔍 **智能搜索** — 聚合型号/OEM码/关键词搜索，支持按类目、品牌、价格、库存筛选
- 🤖 **AI 智能分析** — 拍照即可识别零部件，完整 9 节点分析工作流 + 历史记录
- 🕸️ **知识图谱** — 可视化展示零部件适配关系和替代件
- 📊 **供应链洞察** — 库存、价格区间、交货周期一览
- 🎯 **智能决策** — 磨损评估 + 供应商推荐报告
- ⭐ **收藏管理** — 收藏感兴趣的零部件，本地持久化存储
- 📦 **订单管理** — 完整订单流程，支持状态跟踪

---

## 🚀 快速开始

### 前置要求

- Node.js >= 18.0.0
- npm >= 9.0.0
- Python >= 3.9

### 启动后端

```bash
cd indunexus-api
pip install -r requirements.txt
cp .env.example .env
python3 -m app.init_db   # 首次运行初始化数据库（含种子数据）
python3 run.py
# 后端运行在 http://localhost:8000
# API 文档: http://localhost:8000/docs
```

默认账号：

| 账号 | 密码 | 角色 | 说明 |
|------|------|------|------|
| `admin` | `admin123` | admin | 管理员 |
| `buyer1` | `test123` | buyer | 普通买家 |
| `buyer2` | `test123` | buyer | 普通买家 |
| `supplier1` | `test123` | supplier | SKF 轴承（中国）有限公司 |
| `supplier2` | `test123` | supplier | Brembo 制动系统 |

### 启动前端

```bash
cd indunexus-web
npm install
npm run dev
# 访问 http://localhost:5173
```

---

## ✨ 功能特性

### 已实现

- ✅ **顶部搜索栏** — 聚合搜索、实时建议、智能类型识别（型号/OEM码/关键词）
- ✅ **左侧类目树** — 3 级类目展开（86 个类目，覆盖 15 大系统）、收藏管理
- ✅ **零部件展示** — 网格/列表视图、多维排序（价格/库存/名称/时间）、分页
- ✅ **详情面板** — JSONB 动态规格参数表格、适配信息、操作按钮
- ✅ **AI 智能分析页** — 独立 `/ai-analysis` 路由，完整 9 节点分析工作流
  - 前端 Canvas API 图像预处理（亮度检测、等比压缩、格式校验）
  - 实时进度条 + 工作流时间线
  - 识别结果 / 供应链面板 / 知识图谱 / 智能决策报告
  - 历史记录（localStorage 持久化，按时间范围筛选）
  - 从 Navbar 快速识别入口一键跳转并自动开始分析
- ✅ **用户认证** — 登录/注册、JWT (HS256)、路由守卫 + 角色控制
- ✅ **管理后台** — 用户管理、零部件 CRUD、数据统计
- ✅ **响应式布局** — 桌面/平板/手机多端适配

### 开发中

- ⏳ 知识图谱可视化 (ECharts)
- ⏳ 3D 模型预览 (Three.js)
- ⏳ 真实 AI 识别后端接口对接
- ⏳ 采购清单管理

---

## 🏗️ 技术架构

### 整体架构

```
┌──────────────────────────────────────────────────────────────┐
│                       用户浏览器                              │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │              Vue 3 前端 SPA (Vite 8.0)                 │  │
│  │                                                        │  │
│  │  Views          Components         Stores (Pinia)      │  │
│  │  ├ Home         ├ Navbar           ├ auth              │  │
│  │  ├ AIAnalysis   ├ CategoryTree     └ aiAnalysis        │  │
│  │  ├ Login        ├ AIRecognitionModal                   │  │
│  │  └ AdminDash    └ ai-analysis/*  (8 子组件)            │  │
│  │                                                        │  │
│  │  Vue Router 4 (路由守卫 + 角色鉴权)                    │  │
│  │  Axios Client (camelCase ↔ snake_case 自动转换)        │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                           │ HTTP REST / JSON
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                  FastAPI 后端 (Python 3.9+)                   │
│                                                              │
│  API v1 路由层                                               │
│  ├ /auth        登录、注册、Token、个人信息                   │
│  ├ /parts       SPU/SKU 搜索、CRUD、统计                     │
│  └ /categories  类目树查询                                   │
│                                                              │
│  SQLAlchemy ORM + Pydantic v2 数据校验                       │
│                                                              │
│  ┌──────────────────┐      ┌──────────────────────────────┐  │
│  │  SQLite (开发)   │      │  PostgreSQL + Neo4j (生产规划) │  │
│  │  indunexus.db    │      │  主数据 + 知识图谱             │  │
│  └──────────────────┘      └──────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```
```
flowchart TD
    subgraph Browser ["🖥️ 用户浏览器 (Vue 3 SPA)"]
        direction TB
        
        subgraph Frontend_Modules ["前端核心模块"]
            direction LR
            subgraph Stores ["📦 Pinia Stores"]
                direction TB
                S1([auth])
                S2([aiAnalysis])
                S3([cart/orders])
            end
            
            subgraph Views ["📄 Views"]
                direction TB
                V1([Home])
                V2([AIAnalysis])
                V3([Admin])
            end
            
            subgraph Comps ["🧩 Components"]
                direction TB
                C1([Navbar])
                C2([CategoryTree])
                C3([AIModal])
            end
        end
        
        Router{"🛣️ Vue Router 4\n(路由守卫 + 角色)"}
        Axios["🌐 Axios API Client\n(camelCase ↔ snake)"]
        
        %% 内部排版连线
        Frontend_Modules --> Router
        Router --> Axios
    end

    subgraph Server ["⚙️ FastAPI 后端 (Python)"]
        direction TB
        
        API["🔀 API v1 路由层\n/auth, /parts, /categories, /orders"]
        Logic["🧠 业务逻辑 + SQLAlchemy ORM\nPartSPU / PartSKU / Category / User / Order"]
        
        subgraph DBs ["🗄️ 数据库层"]
            direction LR
            DB1[(PostgreSQL\n主数据库)]
            DB2[(Neo4j\n知识图谱)]
            DB3[(SQLite\n本地开发)]
        end
        
        %% 后端内部连线
        API --> Logic
        Logic --> DB1
        Logic --> DB2
        Logic --> DB3
    end

    %% 前后端通信连线
    Axios -- "HTTP / REST" --> API

    %% 自定义样式
    classDef browser fill:#f8fafc,stroke:#94a3b8,stroke-width:2px,color:#0f172a;
    classDef server fill:#f0fdf4,stroke:#86efac,stroke-width:2px,color:#14532d;
    classDef module fill:#ffffff,stroke:#cbd5e1,stroke-width:1px,color:#334155;
    classDef db fill:#fffbeb,stroke:#fde047,stroke-width:2px,color:#78350f;
    
    class Browser browser;
    class Server server;
    class Stores,Views,Comps module;
    class DB1,DB2,DB3 db;
```

### 技术栈

| 层级 | 技术 | 版本 | 说明 |
|------|------|------|------|
| 前端框架 | Vue 3 Composition API | 3.5 | 响应式 UI |
| 类型系统 | TypeScript | 5.9 | 全量类型覆盖 |
| 构建工具 | Vite | 8.0 | 极速 HMR |
| 状态管理 | Pinia | 3.0 | auth / aiAnalysis store |
| 路由 | Vue Router | 4.6 | SPA 路由 + 角色守卫 |
| 图表 | ECharts | 6.0 | 数据可视化（规划中） |
| HTTP | Axios | 1.x | 自动 camelCase 转换 |
| 后端框架 | FastAPI | 0.115 | 异步 RESTful API |
| ORM | SQLAlchemy | 2.x | 数据库操作 |
| 数据校验 | Pydantic v2 | 2.x | 请求/响应 Schema |
| 数据库（开发） | SQLite | — | 零配置，含种子数据 |
| 数据库（生产） | PostgreSQL | — | 主数据存储 |
| 图数据库 | Neo4j | — | 知识图谱（规划中） |
| 认证 | JWT HS256 | — | 30 分钟有效期 |
| 样式 | CSS Variables | — | 自研设计系统 |
| 图标 | Heroicons | — | SVG 内联 |

### 前端目录结构

```
indunexus-web/src/
├── api/
│   ├── client.ts               # Axios 实例 + camelCase/snake_case 互转
│   ├── auth.ts                 # 认证接口
│   ├── parts.ts                # 零部件接口（SPU→Part 扁平化转换）
│   ├── orders.ts               # 订单接口
│   └── admin.ts                # 管理后台接口
├── components/
│   ├── ai-analysis/            # AI 分析页 8 个子组件
│   │   ├── ImageUploader.vue   # 图像上传 + Canvas 预处理
│   │   ├── WorkflowTimeline.vue# 9 节点工作流可视化
│   │   ├── RecognitionResult.vue
│   │   ├── SupplyChainPanel.vue
│   │   ├── KnowledgeGraphPanel.vue
│   │   ├── DecisionReport.vue
│   │   ├── HistoryPanel.vue
│   │   └── RoadmapSection.vue
│   ├── AIRecognitionModal.vue  # Navbar 快速识别弹窗
│   ├── CategoryTree.vue        # 多级类目树（递归渲染）
│   ├── Navbar.vue              # 顶部导航（角色差异化菜单）
│   └── Toast.vue               # 全局通知
├── composables/
│   └── useImagePreprocessor.ts # Canvas 图像预处理（格式/大小/亮度）
├── mock/
│   └── aiAnalysisMock.ts       # AI 识别 mock 数据与延迟模拟
├── stores/
│   ├── auth.ts                 # 用户认证状态
│   └── aiAnalysis.ts           # AI 分析工作流状态 + localStorage
├── views/
│   ├── Home.vue                # 主页（搜索 + 类目 + 零件列表）
│   ├── AIAnalysisPage.vue      # AI 智能分析页
│   ├── Login.vue               # 登录/注册
│   └── AdminDashboard.vue      # 管理后台
└── types/
    └── aiAnalysis.ts           # AI 分析相关 TypeScript 类型
```

### 后端目录结构

```
indunexus-api/app/
├── api/v1/endpoints/
│   ├── auth.py                 # POST /login  POST /register  GET /me  PUT /me
│   ├── parts_new.py            # POST /parts/search  GET/POST/PUT/DELETE /parts/spu  /sku
│   ├── categories.py           # GET /categories/tree  GET /categories/{id}
│   ├── orders.py               # 订单 CRUD
│   └── users.py                # 用户管理（管理员）
├── models/                     # SQLAlchemy ORM
│   ├── part.py                 # PartSPU + PartSKU（JSONB 动态规格）
│   ├── category.py             # Category（自关联多级树）
│   ├── user.py                 # User（buyer / admin / supplier）
│   ├── order.py                # Order + OrderItem
│   ├── shopping_cart.py        # ShoppingCart
│   ├── user_favorite.py        # UserFavorite
│   ├── user_preset.py          # UserPreset
│   └── ai_recognition.py       # AIRecognition 记录
├── schemas/                    # Pydantic 请求/响应 Schema
├── core/
│   ├── config.py               # 环境配置（SQLite/PostgreSQL/Neo4j/JWT）
│   ├── database.py             # SQLAlchemy 连接池
│   └── security.py             # JWT 生成与校验（HS256）
└── main.py                     # FastAPI 入口 + CORS 配置
```

---

## 🗄️ 数据模型

### 当前数据库状态（截至 2026-03）

| 表 | 记录数 | 说明 |
|----|--------|------|
| users | 5 | 1 admin + 2 buyer + 2 supplier |
| categories | 86 | 3 级类目，覆盖 15 大汽车系统 |
| parts_spu | 164 | 零部件标准产品单元 |
| parts_sku | 164 | 零部件库存单元（1 SPU : 1 SKU） |
| orders | 2 | 测试订单 |
| order_items | 3 | 订单明细 |

### 类目体系（15 大系统）

```
传动系统          → 手动/自动/CVT/DCT 变速器、离合器、差速器、传动轴
底盘系统          → 制动（盘式/鼓式/ABS/ESC）、转向（EPS）、悬架、轮胎车轮
内燃机动力总成    → 进排气、点火、润滑、冷却、燃料供给、配气、发动机结构件
电动动力总成      → 驱动电机、EV减速器、逆变器、PCU动力控制单元
动力电池          → 锂离子电池、镍氢电池、燃料电池、BMS
电子电气系统      → ECU、传感器、线束、连接器、半导体器件
智能驾驶系统      → ADAS、激光雷达、毫米波雷达、超声波雷达、摄像头
空调系统          → 压缩机、冷凝器、蒸发器、鼓风机、PTC加热器
车身系统          → 保险杠、车门、引擎盖、后备箱盖、车窗玻璃、车身结构件
外饰系统          → 车灯（前照灯/尾灯/雾灯）、前格栅、外后视镜
内饰系统          → 仪表板、座椅、安全气囊、安全带、内饰件
车载信息娱乐      → 车载显示屏、音响系统、车载导航
```

### 核心实体关系

```
Category（自关联，3 级）
  └── PartSPU（型号、品牌、OEM码）
        └── PartSKU（JSONB 动态规格、价格、库存、图片、3D模型）
              └── OrderItem / ShoppingCart

User（buyer / admin / supplier）
  ├── UserFavorite → PartSPU
  ├── UserPreset
  └── Order → OrderItem → PartSKU

AIRecognition → PartSPU
```

### SPU / SKU 分离设计

- **SPU**（Standard Product Unit）：零件的标准描述，存储型号（`part_number`）、OEM码、品牌、类目、描述
- **SKU**（Stock Keeping Unit）：具体规格变体，使用 `JSONB` 存储动态参数，支持不同类目的差异化规格字段

```json
// SKU specifications 示例（轴承类）
{
  "material": "轴承钢",
  "dimensions": {
    "innerDiameter": 25,
    "outerDiameter": 52,
    "width": 15,
    "unit": "mm"
  },
  "tolerance": "P5",
  "sealType": "密封圈"
}
```

### 品牌覆盖

国际品牌：博世、大陆、电装、法雷奥、采埃孚、舍弗勒、爱信、博格华纳、格特拉克、天合、布雷博、海拉、李尔、安通林、佛吉亚、德尔福、Mobileye、哈曼、三星SDI、松下

国内品牌：宁德时代、比亚迪、三电、特斯拉（中国）

---

## 🤖 AI 智能分析工作流

AI 分析页（`/ai-analysis`，仅 buyer 角色可访问）实现完整的 9 节点分析链路：

```
图像接收 → 预处理 → 目标检测 → 特征提取 → 向量匹配
         → 知识图谱匹配 → 供应链查询 → 决策引擎 → 输出结果
```

### 图像预处理（前端 Canvas API）

| 检查项 | 规则 | 处理方式 |
|--------|------|----------|
| 文件格式 | JPG / PNG / WEBP | 不符合则拒绝 |
| 文件大小 | ≤ 10MB | 超限则拒绝 |
| 图像尺寸 | 最长边 > 2048px | 等比缩放至 2048px |
| 亮度检测 | 灰度均值 < 30/100 | 展示警告，允许继续 |

### 识别结果置信度分级

| 置信度 | 等级 | 颜色 | 处理 |
|--------|------|------|------|
| ≥ 85% | 高置信度 | 绿色 | 直接展示结果 |
| 70–84% | 中等置信度 | 橙色 | 展示结果 + 候选列表 |
| < 70% | 低置信度 | 红色 | 降级横幅 + 人工审核入口 |

### 磨损评估等级

| 等级 | 颜色 | 建议 |
|------|------|------|
| 正常 (normal) | 绿色 | 继续使用 |
| 轻度 (light) | 蓝色 | 计划维修 |
| 中度 (moderate) | 橙色 | 立即维修 |
| 重度 (severe) | 红色 | 立即更换 |

---

## 🔌 API 接口

基础路径：`/api/v1`，完整交互文档见 `http://localhost:8000/docs`

### 认证模块 `/auth`

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| POST | `/auth/login` | 登录，返回 JWT Token | 公开 |
| POST | `/auth/register` | 注册新用户 | 公开 |
| GET | `/auth/me` | 获取当前用户信息 | 登录 |
| PUT | `/auth/me` | 更新个人信息 | 登录 |

### 零部件模块 `/parts`

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| POST | `/parts/search` | 搜索零部件（支持关键词/类目/品牌/价格/库存筛选） | 公开 |
| GET | `/parts/search` | 搜索零部件（GET 版本） | 公开 |
| GET | `/parts/spu/{id}` | 获取 SPU 详情（含所有 SKU） | 公开 |
| GET | `/parts/sku/{id}` | 获取 SKU 详情 | 公开 |
| GET | `/parts/recommended` | 获取推荐零部件 | 公开 |
| POST | `/parts/spu` | 创建 SPU | admin |
| PUT | `/parts/spu/{id}` | 更新 SPU | admin |
| DELETE | `/parts/spu/{id}` | 删除 SPU（级联删除 SKU） | admin |
| POST | `/parts/sku` | 创建 SKU | admin |
| PUT | `/parts/sku/{id}` | 更新 SKU | admin |
| DELETE | `/parts/sku/{id}` | 删除 SKU | admin |
| GET | `/parts/stats/summary` | 零部件统计数据 | admin |

### 类目模块 `/categories`

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | `/categories/tree` | 获取完整类目树（3 级） | 公开 |
| GET | `/categories/{id}` | 获取单个类目 | 公开 |

### 认证方式

```http
Authorization: Bearer <JWT_TOKEN>
```

Token 通过 `POST /auth/login` 获取，有效期 30 分钟。

### 搜索请求示例

```json
POST /api/v1/parts/search
{
  "keyword": "制动",
  "category_id": "f61f72d2-40d1-4b38-85ba-f4f504c280fd",
  "brand": "博世",
  "filters": {
    "min_price": 100,
    "max_price": 5000,
    "in_stock": true
  },
  "sort_by": "price",
  "sort_order": "asc",
  "page": 1,
  "page_size": 20
}
```

---

## 🎨 设计系统

### 配色方案

```css
--color-primary:    #0f172a;   /* 主色（深海军蓝）*/
--color-cta:        #0369a1;   /* 行动色（工业蓝）*/
--color-background: #f8fafc;   /* 背景色 */
--color-surface:    #ffffff;   /* 卡片/面板 */
--color-border:     #e2e8f0;   /* 边框 */
--color-text-muted: #475569;   /* 次要文字（最低对比度 slate-600）*/
```

### 设计原则

- 数据密集 — 最大化信息展示，减少空白浪费
- 专业严谨 — 工业软件风格，无装饰性元素
- 高效交互 — 快速响应，平滑动画（150–300ms）

详细规范见 [design-system/indunexus/MASTER.md](design-system/indunexus/MASTER.md)

---

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: add AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

详见 [CONTRIBUTING.md](CONTRIBUTING.md)

---

## 📝 更新日志

### v1.2.0 (2026-03)

- ✨ 新增独立 AI 智能分析页 (`/ai-analysis`)
- ✨ 完整 9 节点分析工作流 + 实时进度
- ✨ 前端 Canvas API 图像预处理（亮度检测、等比压缩）
- ✨ 分析历史记录 localStorage 持久化
- ✨ Navbar 快速识别入口一键跳转

### v1.1.0 (2026-02)

- ✅ 用户认证与权限（JWT HS256）
- ✅ 管理后台（用户管理 + 零部件 CRUD）
- ✅ 订单管理流程
- ✅ Pinia 状态管理

### v1.0.0 (2026-01)

- ✨ 初始版本发布
- ✅ SPU/SKU 分离数据模型
- ✅ 86 类目 + 164 零部件种子数据
- ✅ 核心 UI 组件 + 响应式布局
- ✅ 设计系统集成

---

## 📄 许可证

MIT License — 详见 [LICENSE](LICENSE)

---

<div align="center">

**智链数科 — 让工业品采购更智能**

Made with ❤️ by InduNexus Team

</div>
