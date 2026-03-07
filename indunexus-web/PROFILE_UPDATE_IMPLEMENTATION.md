# 个人信息编辑功能实现文档

## 功能概述

实现了完整的个人信息编辑功能，包括：
- 用户名、邮箱编辑
- 头像上传（支持本地预览）
- 公司信息编辑（供应商和采购员）
- 表单验证
- 实时保存到后端

## 实现的文件

### 前端

1. **indunexus-web/src/views/Profile.vue**
   - 完整的个人信息界面
   - 编辑模式切换
   - 头像上传功能（文件类型验证、大小限制 5MB）
   - 表单验证和错误提示
   - 美化的 UI 设计（渐变背景、卡片阴影、悬停效果）

2. **indunexus-web/src/stores/auth.ts**
   - 新增 `updateProfile` 方法
   - 更新用户信息并同步到 localStorage
   - 错误处理

3. **indunexus-web/src/api/auth.ts**
   - 新增 `updateProfile` API 调用
   - 新增 `UpdateProfileRequest` 接口
   - 自动处理 camelCase 到 snake_case 转换

### 后端

1. **indunexus-api/app/api/v1/endpoints/auth.py**
   - 新增 `PUT /api/v1/auth/profile` 端点
   - 验证用户名和邮箱唯一性
   - 更新用户信息到数据库

2. **indunexus-api/app/schemas/user.py**
   - 新增 `UserProfileUpdate` Schema
   - 支持可选字段更新

## API 端点

### 更新个人信息

**请求:**
```http
PUT /api/v1/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "新用户名",
  "email": "new@email.com",
  "avatar": "data:image/png;base64,...",
  "company_name": "公司名称",
  "company_description": "公司简介"
}
```

**响应:**
```json
{
  "success": true,
  "message": "个人信息更新成功",
  "data": {
    "id": "uuid",
    "username": "新用户名",
    "email": "new@email.com",
    "role": "buyer",
    "avatar": "data:image/png;base64,...",
    "company_name": "公司名称",
    "company_description": "公司简介",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00"
  }
}
```

**错误响应:**
```json
{
  "success": false,
  "message": "用户名已存在"
}
```

## 功能特性

### 1. 编辑模式
- 点击"编辑"按钮进入编辑模式
- 显示"取消"和"保存"按钮
- 取消时恢复原始数据

### 2. 头像上传
- 支持图片文件上传
- 文件类型验证（只允许图片）
- 文件大小限制（最大 5MB）
- 实时预览上传的图片
- Base64 编码存储

### 3. 表单验证
- 用户名唯一性验证
- 邮箱唯一性验证
- 邮箱格式验证（后端）
- 实时错误提示

### 4. 用户体验
- 加载状态显示
- 成功/失败 Toast 提示
- 平滑的动画过渡
- 响应式设计（移动端适配）

### 5. 安全性
- JWT Token 认证
- 只能修改自己的信息
- 密码不在此接口更新

## 数据库字段

User 表包含以下可编辑字段：
- `username` - 用户名（唯一）
- `email` - 邮箱（唯一）
- `avatar` - 头像 URL 或 Base64
- `company_name` - 公司名称（可选）
- `company_description` - 公司简介（可选）

## 使用方法

### 启动后端服务器
```bash
cd indunexus-api
python3 run.py
```

### 启动前端开发服务器
```bash
cd indunexus-web
npm run dev
```

### 测试流程
1. 登录系统
2. 点击右上角头像进入个人信息页面
3. 点击"编辑"按钮
4. 修改用户名、邮箱或上传头像
5. 点击"保存"按钮
6. 查看成功提示

## 待优化项

1. **头像上传到服务器**
   - 当前使用 Base64 存储在数据库
   - 建议改为上传到对象存储（OSS）
   - 返回 URL 而非 Base64

2. **修改密码功能**
   - 需要单独的端点
   - 需要验证旧密码
   - 建议发送邮件通知

3. **邮箱验证**
   - 修改邮箱后发送验证邮件
   - 验证通过后才生效

4. **头像裁剪**
   - 添加图片裁剪功能
   - 统一头像尺寸和比例

## 技术栈

- **前端**: Vue 3 + TypeScript + Pinia
- **后端**: FastAPI + SQLAlchemy + Pydantic
- **认证**: JWT Token
- **数据库**: SQLite (可切换到 PostgreSQL)

## 注意事项

1. 所有字段都是可选的，只更新提供的字段
2. 用户名和邮箱必须唯一
3. 头像大小限制为 5MB
4. 公司信息只对供应商和采购员显示
5. 角色和注册时间不可编辑
