# 智链数科 (InduNexus) - 工业零部件智能采购平台

<div align="center">

**基于 AI 视觉与知识图谱的工业品采购平台**

[![Vue 3](https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vue.js)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite)](https://vitejs.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[快速开始](#-快速开始) • [功能特性](#-功能特性) • [技术架构](#-技术架构) • [贡献指南](#-贡献指南)

</div>

---

## 📖 项目简介

智链数科是一个专为工业品供应链打造的零部件智能采购平台，解决"非标 SKU 识别难、人货匹配效率低"的核心痛点。平台集成 AI 图像识别、知识图谱、供应链数据分析于一体，为采购人员提供从识别到决策的完整工作流。

### 核心价值

- 🔍 **智能搜索** - 聚合型号/图号/条码搜索，自动识别搜索类型
- 🤖 **AI 智能分析** - 拍照即可识别零部件，完整分析工作流 + 历史记录
- 🕸️ **知识图谱** - 可视化展示零部件适配关系和替代件
- 📊 **供应链洞察** - 库存、价格区间、交货周期一览
- 🎯 **智能决策** - 磨损评估 + 供应商推荐报告
- ⭐ **收藏管理** - 收藏感兴趣的零部件，本地持久化存储
- 📦 **订单管理** - 完整订单流程，支持状态跟踪

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
python3 -m app.init_db   # 首次运行初始化数据库
python3 run.py
# 后端运行在 http://localhost:8000
# API 文档: http://localhost:8000/docs
```

默认账号：

| 账号 | 密码 | 角色 |
|------|------|------|
| `admin` | `admin123` | 管理员 |
| `test` | `test123` | 普通买家 |

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

- ✅ **顶部搜索栏** - 聚合搜索、实时建议、智能类型识别
- ✅ **左侧类目树** - 多级展开、收藏管理、常用选型
- ✅ **零部件展示** - 网格/列表视图、排序、无限滚动
- ✅ **详情面板** - 参数表格、适配信息、操作按钮
- ✅ **AI 智能分析页** - 独立 `/ai-analysis` 路由，完整 9 节点分析工作流
  - 图像预处理（亮度检测、压缩、格式校验）
  - 实时进度条 + 工作流时间线
  - 识别结果 / 供应链面板 / 知识图谱 / 智能决策报告
  - 历史记录（localStorage 持久化，按时间范围筛选）
  - 从 Navbar 快速识别入口一键跳转并自动开始分析
- ✅ **用户认证** - 登录/注册、JWT、路由守卫
- ✅ **管理后台** - 用户管理、数据统计
- ✅ **响应式布局** - 桌面/平板/手机多端适配

### 开发中

- ⏳ 知识图谱可视化 (ECharts/AntV)
- ⏳ 3D 模型预览 (Three.js)
- ⏳ 真实 AI 识别后端接口对接
- ⏳ 采购清单管理

---

## 🏗️ 技术架构

### 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | Vue 3 (Composition API) + TypeScript |
| 构建工具 | Vite 8.0 |
| 状态管理 | Pinia |
| 路由 | Vue Router 4 |
| 后端框架 | FastAPI (Python) |
| 数据库 | SQLite (开发) |
| 样式 | 自研设计系统 (CSS Variables) |
| 图标 | Heroicons (SVG 内联) |

### 项目结构

```
indunexus/
├── indunexus-web/              # 前端
│   └── src/
│       ├── components/
│       │   ├── ai-analysis/    # AI 分析页子组件
│       │   │   ├── ImageUploader.vue
│       │   │   ├── WorkflowTimeline.vue
│       │   │   ├── RecognitionResult.vue
│       │   │   ├── SupplyChainPanel.vue
│       │   │   ├── KnowledgeGraphPanel.vue
│       │   │   ├── DecisionReport.vue
│       │   │   ├── HistoryPanel.vue
│       │   │   └── RoadmapSection.vue
│       │   ├── AIRecognitionModal.vue
│       │   └── Navbar.vue
│       ├── views/
│       │   ├── AIAnalysisPage.vue
│       │   ├── Home.vue
│       │   └── ...
│       ├── stores/
│       │   └── aiAnalysis.ts   # Pinia store
│       ├── composables/
│       │   └── useImagePreprocessor.ts
│       ├── mock/
│       │   └── aiAnalysisMock.ts
│       └── types/
│           └── aiAnalysis.ts
├── indunexus-api/              # 后端
│   └── app/
│       ├── api/v1/endpoints/
│       ├── models/
│       ├── schemas/
│       └── core/
└── design-system/              # 设计规范
```

---

## 🎨 设计系统

### 配色方案

```css
--color-primary: #0f172a;   /* 主色 */
--color-cta:     #0369a1;   /* 行动色 */
--color-background: #f8fafc;
```

### 设计原则

- 📐 数据密集 — 最大化信息展示，减少空白浪费
- 🎯 专业严谨 — 工业软件风格
- ⚡ 高效交互 — 快速响应，平滑动画

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
- ✨ 图像预处理（亮度检测、压缩）
- ✨ 分析历史记录持久化
- ✨ Navbar 快速识别入口一键跳转

### v1.1.0 (2026-02)

- ✅ 用户认证与权限（JWT）
- ✅ 管理后台
- ✅ 订单管理流程
- ✅ Pinia 状态管理

### v1.0.0 (2026-01)

- ✨ 初始版本发布
- ✅ 核心 UI 组件
- ✅ 响应式布局
- ✅ 设计系统集成

---

## 📄 许可证

MIT License — 详见 [LICENSE](LICENSE)

---

<div align="center">

**智链数科 — 让工业品采购更智能**

Made with ❤️ by InduNexus Team

</div>
