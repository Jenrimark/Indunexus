# 智鉴车件 (InduNexus) - Web 前端

基于 AI 视觉与知识图谱的零部件智能识别系统前端界面。

## 🎨 设计系统

本项目使用 **ui-ux-pro-max** 设计系统，采用数据密集型仪表板风格：

- **配色方案**: Healthcare Trust (蓝色数据 + 琥珀色高亮)
- **字体系统**: Fira Code (标题) + Fira Sans (正文)
- **设计风格**: 专业、严谨、高效的工业软件风格

## 🚀 技术栈

- **框架**: Vue 3 (Composition API) + TypeScript
- **构建工具**: Vite
- **状态管理**: 组件内状态 (未来可扩展 Pinia)
- **样式**: 自研设计系统 (CSS Variables)
- **图标**: Heroicons (SVG 内联)

## 📦 项目结构

```
indunexus-web/
├── src/
│   ├── components/          # Vue 组件
│   │   ├── SearchBar.vue           # 顶部搜索栏
│   │   ├── CategoryTree.vue        # 左侧类目树
│   │   ├── CategoryTreeNode.vue    # 类目树节点
│   │   ├── PartCard.vue            # 零部件卡片
│   │   ├── PartsGrid.vue           # 零部件网格/列表
│   │   ├── DetailPanel.vue         # 右侧详情面板
│   │   └── AIRecognitionModal.vue  # AI 识图模态框
│   ├── types/               # TypeScript 类型定义
│   │   └── index.ts
│   ├── App.vue              # 主应用组件
│   ├── main.ts              # 应用入口
│   └── style.css            # 全局样式 (设计系统)
├── public/                  # 静态资源
├── design-system/           # 设计系统文档
│   └── indunexus/
│       ├── MASTER.md        # 全局设计规范
│       └── pages/           # 页面特定设计覆盖
└── package.json
```

## 🛠️ 安装与运行

### 1. 安装依赖

```bash
cd indunexus-web
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173

### 3. 构建生产版本

```bash
npm run build
```

### 4. 预览生产构建

```bash
npm run preview
```

## 🎯 核心功能

### 已实现

- ✅ 顶部搜索栏 (聚合搜索、搜索建议)
- ✅ 左侧类目树 (多级展开、收藏、常用选型)
- ✅ 零部件网格/列表视图 (瀑布流、列表切换)
- ✅ 零部件卡片 (图片、参数、价格、库存)
- ✅ 右侧详情面板 (参数表格、适配信息、操作按钮)
- ✅ AI 识图模态框 (拖拽上传、识别结果展示)
- ✅ 响应式布局 (支持 1920px / 1440px / 1024px / 768px)

### 待实现

- ⏳ 动态参数筛选器
- ⏳ 知识图谱可视化 (使用 ECharts / AntV)
- ⏳ 3D 模型预览 (使用 Three.js)
- ⏳ 采购清单管理
- ⏳ 用户认证与权限
- ⏳ 后端 API 集成

## 🎨 设计规范

### 颜色系统

```css
--color-primary: #1E40AF;    /* 主色 - 蓝色 */
--color-secondary: #3B82F6;  /* 次要色 - 浅蓝 */
--color-cta: #F59E0B;        /* 行动号召 - 琥珀色 */
--color-bg: #F8FAFC;         /* 背景色 */
--color-text: #1E3A8A;       /* 文本色 */
```

### 字体系统

```css
--font-heading: 'Fira Code', monospace;  /* 标题、代码 */
--font-body: 'Fira Sans', sans-serif;    /* 正文 */
```

### 间距系统

```css
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
```

## 📱 响应式断点

- **大屏**: ≥ 1920px (三栏完整展示)
- **标准屏**: 1366px - 1920px (三栏比例调整)
- **小屏**: < 1366px (右侧面板默认收缩)
- **平板**: < 1024px (左侧抽屉、右侧底部弹出)
- **手机**: < 768px (单栏布局)

## 🔧 开发指南

### 组件开发规范

1. **使用 Composition API**
```typescript
<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Part } from '../types';

const selectedPart = ref<Part | undefined>();
</script>
```

2. **类型安全**
```typescript
interface Props {
  part: Part;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  select: [part: Part];
}>();
```

3. **样式规范**
- 使用 CSS Variables
- 添加 `cursor-pointer` 到可点击元素
- 使用 `transition-colors` 或 `transition-all`
- 确保 hover 状态有视觉反馈

### 无障碍规范

- 所有图片添加 `alt` 属性
- 按钮添加 `aria-label` (如果没有文本)
- 使用语义化 HTML 标签
- 确保键盘导航可用
- 支持 `prefers-reduced-motion`

## 🐛 已知问题

- [ ] 搜索建议需要防抖优化
- [ ] 无限滚动需要虚拟化优化
- [ ] AI 识图需要对接真实 API
- [ ] 需要添加错误边界处理

## 📝 待办事项

### 短期 (本周)
- [ ] 实现动态参数筛选器组件
- [ ] 添加加载骨架屏
- [ ] 优化移动端体验

### 中期 (本月)
- [ ] 集成 ECharts 知识图谱
- [ ] 添加 Three.js 3D 预览
- [ ] 实现采购清单功能
- [ ] 对接后端 API

### 长期 (3 个月)
- [ ] 添加单元测试
- [ ] 性能优化 (代码分割、懒加载)
- [ ] SEO 优化
- [ ] PWA 支持

## 📚 参考文档

- [Vue 3 文档](https://vuejs.org/)
- [TypeScript 文档](https://www.typescriptlang.org/)
- [Vite 文档](https://vitejs.dev/)
- [设计系统文档](../design-system/indunexus/MASTER.md)

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

MIT License

---

**智鉴车件** - 让工业品采购更智能
