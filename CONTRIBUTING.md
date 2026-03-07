# 贡献指南

感谢你对智鉴车件项目的关注！我们欢迎所有形式的贡献。

## 开发环境设置

### 前端 (indunexus-web)

```bash
cd indunexus-web
npm install
cp .env.example .env.development
npm run dev
```

### 后端 (indunexus-api)

```bash
cd indunexus-api
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python run.py
```

## 提交规范

我们使用 Conventional Commits 规范：

- `feat:` 新功能
- `fix:` 修复 Bug
- `docs:` 文档更新
- `style:` 代码格式调整
- `refactor:` 代码重构
- `test:` 测试相关
- `chore:` 构建/工具链更新

示例：
```
feat: 添加零部件收藏功能
fix: 修复搜索建议显示问题
docs: 更新 API 文档
```

## Pull Request 流程

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'feat: add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启 Pull Request

## 代码规范

### 前端

- 使用 TypeScript 类型安全
- 遵循 Vue 3 Composition API 最佳实践
- 使用 `<script setup>` 语法
- 确保无障碍支持 (ARIA 属性、键盘导航)
- 添加必要的注释

### 后端

- 遵循 PEP 8 规范
- 使用类型提示 (Type Hints)
- 编写清晰的 docstring
- 确保 API 文档完整

## 测试

提交前请确保：

- [ ] 代码通过 lint 检查
- [ ] 新功能添加了测试
- [ ] 所有测试通过
- [ ] 文档已更新

## 问题反馈

如果你发现 Bug 或有功能建议，请：

1. 检查是否已有相关 Issue
2. 创建新 Issue，提供详细信息：
   - 问题描述
   - 复现步骤
   - 预期行为
   - 实际行为
   - 环境信息 (浏览器、操作系统等)

## 联系方式

- GitHub Issues: 技术问题和 Bug 反馈
- Email: contact@indunexus.com

再次感谢你的贡献！🎉
