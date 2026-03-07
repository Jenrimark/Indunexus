# 智鉴车件 (InduNexus) - 零部件智能识别系统

<div align="center">

**基于 AI 视觉与知识图谱的工业品采购平台**

[![Vue 3](https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vue.js)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[快速开始](#-快速开始) • [功能特性](#-功能特性) • [设计系统](#-设计系统) • [文档](#-文档) • [贡献指南](#-贡献指南)

</div>

---

## 📖 项目简介

智鉴车件是一个专为汽车后市场供应链打造的零部件智能识别系统，旨在解决"非标 SKU 识别难、人货匹配效率低"的核心痛点。

### 核心价值

- 🔍 **智能搜索** - 聚合型号/图号/条码搜索，自动识别搜索类型
- 🤖 **AI 识图** - 拍照即可识别零部件，无需记忆复杂型号
- 🕸️ **知识图谱** - 可视化展示零部件适配关系和替代件
- 📊 **数据密集** - 工业软件风格，最大化信息展示效率
- 🎯 **精准匹配** - 动态参数筛选，快速找到符合要求的零部件
- ⭐ **收藏管理** - 收藏感兴趣的零部件，支持本地持久化存储
- 📦 **订单管理** - 完整的订单流程管理，支持状态跟踪和操作

---

## 🚀 快速开始

### 前置要求

- Node.js >= 18.0.0
- npm >= 9.0.0

### 安装与运行

```bash
# 1. 进入项目目录
cd indunexus-web

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev

# 4. 访问应用
# 打开浏览器访问 http://localhost:5173
```

### 构建生产版本

```bash
npm run build
npm run preview
```

详细说明请查看 [快速启动指南](QUICK_START.md)

---

## ✨ 功能特性

### 已实现功能

- ✅ **顶部搜索栏** - 聚合搜索、实时建议、智能类型识别
- ✅ **左侧类目树** - 多级展开、收藏管理、常用选型
- ✅ **零部件展示** - 网格/列表视图、排序、无限滚动
- ✅ **详情面板** - 参数表格、适配信息、操作按钮
- ✅ **AI 识图** - 拖拽上传、识别进度、结果展示
- ✅ **响应式布局** - 支持桌面/平板/手机多端适配

### 开发中功能

- ⏳ 动态参数筛选器
- ⏳ 知识图谱可视化 (ECharts/AntV)
- ⏳ 3D 模型预览 (Three.js)
- ⏳ 采购清单管理
- ⏳ 用户认证与权限

---

## 🎨 设计系统

本项目使用 **ui-ux-pro-max** 设计系统，采用数据密集型仪表板风格。

### 配色方案

```css
--color-primary: #1E40AF;    /* 主色 - 蓝色 */
--color-secondary: #3B82F6;  /* 次要色 - 浅蓝 */
--color-cta: #F59E0B;        /* 行动色 - 琥珀色 */
--color-bg: #F8FAFC;         /* 背景色 */
--color-text: #1E3A8A;       /* 文本色 */
```

### 字体系统

- **标题**: Fira Code (等宽字体，适合显示型号、代码)
- **正文**: Fira Sans (无衬线字体，易读性强)

### 设计原则

- 📐 **数据密集** - 最大化信息展示，减少空白浪费
- 🎯 **专业严谨** - 工业软件风格，体现技术专业性
- ⚡ **高效交互** - 快速响应，平滑动画，清晰反馈
- ♿ **无障碍** - 符合 WCAG AA 标准，支持键盘导航

详细设计规范请查看 [设计展示文档](DESIGN_SHOWCASE.md)

---

## 🏗️ 技术架构

### 技术栈

- **框架**: Vue 3 (Composition API) + TypeScript
- **构建工具**: Vite 8.0
- **状态管理**: 组件内状态 (未来可扩展 Pinia)
- **样式**: 自研设计系统 (CSS Variables)
- **图标**: Heroicons (SVG 内联)

### 项目结构

```
indunexus-web/
├── src/
│   ├── components/          # Vue 组件
│   │   ├── SearchBar.vue
│   │   ├── CategoryTree.vue
│   │   ├── PartCard.vue
│   │   ├── PartsGrid.vue
│   │   ├── DetailPanel.vue
│   │   └── AIRecognitionModal.vue
│   ├── types/               # TypeScript 类型
│   ├── App.vue              # 主应用
│   ├── main.ts              # 入口文件
│   └── style.css            # 全局样式
├── design-system/           # 设计系统文档
└── public/                  # 静态资源
```

---

## 📚 文档

### 核心文档

- 📘 [项目总结](PROJECT_SUMMARY.md) - 项目概览、完成度、技术指标
- 🚀 [快速启动](QUICK_START.md) - 安装、运行、开发指南
- 🎨 [设计展示](DESIGN_SHOWCASE.md) - 视觉设计、交互动画、响应式
- 📦 [组件 API](COMPONENT_API.md) - 组件 Props、Emits、类型定义

### 参考文档

- 📋 [设计方案](参考文件/设计.md) - 需求分析、功能设计、数据库设计
- 🔧 [技术栈方案](参考文件/语言.md) - 技术选型、架构设计、实施路线

### 设计系统

- 🎯 [全局设计规范](design-system/indunexus/MASTER.md)
- 📄 [知识图谱页面](design-system/indunexus/pages/knowledge-graph.md)

---

## 🎯 核心组件

### SearchBar - 顶部搜索栏

```vue
<SearchBar />
```

- 聚合搜索 (型号/图号/条码)
- 实时搜索建议
- AI 识图入口
- 用户菜单

### CategoryTree - 左侧类目树

```vue
<CategoryTree />
```

- 多级类目展开/折叠
- 我的收藏列表
- 常用选型快捷方式

### PartsGrid - 零部件网格

```vue
<PartsGrid
  @select-part="handleSelectPart"
  @favorite="handleFavorite"
  @add-to-cart="handleAddToCart"
/>
```

- 网格/列表视图切换
- 排序控制
- 无限滚动

### DetailPanel - 详情面板

```vue
<DetailPanel
  :part="selectedPart"
  @add-to-cart="handleAddToCart"
/>
```

- 技术参数表格
- 适配车型信息
- 操作按钮

### AIRecognitionModal - AI 识图

```vue
<AIRecognitionModal
  :is-open="showModal"
  @close="showModal = false"
  @select-result="handleResult"
/>
```

- 拖拽上传图片
- 识别进度显示
- Top 5 结果展示

详细 API 请查看 [组件 API 文档](COMPONENT_API.md)

---

## 📊 性能指标

### 构建产物

```
dist/index.html                  0.45 kB │ gzip:  0.29 kB
dist/assets/index-*.css         25.00 kB │ gzip:  4.42 kB
dist/assets/index-*.js          94.94 kB │ gzip: 35.17 kB
```

### 性能优化

- ✅ 代码分割 (路由级别懒加载)
- ✅ 图片懒加载 (loading="lazy")
- ✅ 无限滚动 (Intersection Observer)
- ✅ CSS 压缩 (82.3% 压缩率)
- ✅ JS 压缩 (62.9% 压缩率)

---

## 🛠️ 开发指南

### 组件开发规范

```vue
<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Part } from '../types';

interface Props {
  part: Part;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  select: [part: Part];
}>();
</script>
```

### 样式开发规范

```vue
<style scoped>
.component {
  /* 使用 CSS Variables */
  color: var(--color-text);
  padding: var(--space-4);
  
  /* 添加过渡动画 */
  transition: all var(--transition-base);
}

.component:hover {
  /* 添加 Hover 反馈 */
  background: var(--color-gray-50);
  transform: translateY(-2px);
}

/* 可点击元素添加 cursor-pointer */
.clickable {
  cursor: pointer;
}
</style>
```

### 无障碍规范

- ✅ 使用语义化 HTML 标签
- ✅ 添加 ARIA 属性
- ✅ 确保键盘导航可用
- ✅ 提供 Focus 状态样式
- ✅ 确保对比度 ≥ 4.5:1

---

## 🧪 测试

### 运行测试 (待实现)

```bash
# 单元测试
npm run test

# E2E 测试
npm run test:e2e

# 测试覆盖率
npm run test:coverage
```

---

## 📈 路线图

### 短期 (本周)

- [ ] 实现动态参数筛选器
- [ ] 添加加载骨架屏
- [ ] 优化移动端体验

### 中期 (本月)

- [ ] 集成 ECharts 知识图谱
- [ ] 添加 Three.js 3D 预览
- [ ] 实现采购清单功能
- [ ] 对接后端 API

### 长期 (3 个月)

- [ ] 用户认证与权限
- [ ] 性能优化 (SSR、CDN)
- [ ] 单元测试与 E2E 测试
- [ ] PWA 支持

---

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 贡献流程

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 代码规范

- 使用 TypeScript 类型安全
- 遵循 Vue 3 Composition API 最佳实践
- 遵循设计系统规范
- 添加必要的注释
- 确保无障碍支持

---

## 📝 更新日志

### v1.0.0 (2026)

- ✨ 初始版本发布
- ✅ 完成核心 UI 组件
- ✅ 实现响应式布局
- ✅ 集成设计系统
- ✅ 添加 TypeScript 类型定义

---

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

---

## 👥 团队

- **产品设计** - 基于 ui-ux-pro-max 设计系统
- **前端开发** - Vue 3 + TypeScript
- **UI/UX** - 工业软件风格设计

---

## 🙏 致谢

- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Vite](https://vitejs.dev/) - 下一代前端构建工具
- [TypeScript](https://www.typescriptlang.org/) - JavaScript 的超集
- [Heroicons](https://heroicons.com/) - 精美的 SVG 图标
- [ui-ux-pro-max](https://github.com/ui-ux-pro-max) - 设计系统生成工具

---

## 📞 联系我们

- 📧 Email: contact@indunexus.com
- 🌐 Website: https://indunexus.com
- 💬 Issues: [GitHub Issues](https://github.com/indunexus/web/issues)

---

<div align="center">

**智鉴车件 - 让工业品采购更智能** 🚀

Made with ❤️ by InduNexus Team

</div>
