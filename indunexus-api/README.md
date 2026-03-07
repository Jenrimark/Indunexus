# InduNexus API - 后端服务

基于 FastAPI 的零部件智能识别系统后端 API。

## 🚀 快速开始

### 1. 安装依赖

```bash
cd indunexus-api
pip install -r requirements.txt
```

### 2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件，修改配置
```

### 3. 初始化数据库

```bash
python -m app.init_db
```

这将创建数据库表并插入初始数据：
- 管理员账号: `admin` / `admin123`
- 测试账号: `test` / `test123`
- 50 个测试零部件

### 4. 启动服务

```bash
python run.py
```

或使用 uvicorn:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

访问:
- API 文档: http://localhost:8000/docs
- ReDoc 文档: http://localhost:8000/redoc
- 健康检查: http://localhost:8000/health

## 📚 API 文档

### 认证 API

#### 注册
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "username": "newuser",
  "email": "user@example.com",
  "password": "password123"
}
```

#### 登录
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

响应:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user-001",
      "username": "admin",
      "email": "admin@indunexus.com",
      "role": "admin",
      "avatar": "https://..."
    }
  }
}
```

#### 获取当前用户
```http
GET /api/v1/auth/me
Authorization: Bearer {token}
```

### 零部件 API

#### 搜索零部件
```http
POST /api/v1/parts/search
Content-Type: application/json

{
  "keyword": "轴承",
  "category_id": "bearing",
  "sort_by": "relevance",
  "sort_order": "desc",
  "page": 1,
  "page_size": 20
}
```

#### 获取零部件详情
```http
GET /api/v1/parts/{part_id}
```

#### 获取推荐零部件
```http
GET /api/v1/parts/{part_id}/recommended
```

## 🗄️ 数据库

### SQLite (开发环境)
```env
DATABASE_URL=sqlite:///./indunexus.db
```

### PostgreSQL (生产环境)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/indunexus
```

### 数据库迁移

使用 Alembic 进行数据库迁移:

```bash
# 初始化迁移
alembic init alembic

# 创建迁移
alembic revision --autogenerate -m "Initial migration"

# 执行迁移
alembic upgrade head
```

## 📦 项目结构

```
indunexus-api/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── endpoints/
│   │       │   ├── auth.py      # 认证 API
│   │       │   └── parts.py     # 零部件 API
│   │       └── router.py        # 路由汇总
│   ├── core/
│   │   ├── config.py            # 配置
│   │   ├── database.py          # 数据库
│   │   └── security.py          # 安全工具
│   ├── models/
│   │   ├── user.py              # 用户模型
│   │   └── part.py              # 零部件模型
│   ├── schemas/
│   │   ├── user.py              # 用户 Schema
│   │   ├── part.py              # 零部件 Schema
│   │   └── response.py          # 响应 Schema
│   ├── init_db.py               # 数据库初始化
│   └── main.py                  # 主应用
├── .env.example                 # 环境变量示例
├── requirements.txt             # 依赖
├── run.py                       # 启动脚本
└── README.md                    # 说明文档
```

## 🔧 开发指南

### 添加新的 API 端点

1. 在 `app/api/v1/endpoints/` 创建新文件
2. 定义路由和处理函数
3. 在 `app/api/v1/router.py` 注册路由

### 添加新的数据模型

1. 在 `app/models/` 创建模型文件
2. 在 `app/schemas/` 创建对应的 Schema
3. 运行数据库迁移

### 测试 API

使用 FastAPI 自动生成的文档:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

或使用 curl:
```bash
# 登录
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# 搜索零部件
curl -X POST http://localhost:8000/api/v1/parts/search \
  -H "Content-Type: application/json" \
  -d '{"keyword":"轴承","page":1,"page_size":20}'
```

## 🚀 部署

### Docker 部署

```bash
# 构建镜像
docker build -t indunexus-api .

# 运行容器
docker run -d -p 8000:8000 \
  -e DATABASE_URL=postgresql://... \
  indunexus-api
```

### 生产环境配置

1. 使用 PostgreSQL 数据库
2. 修改 SECRET_KEY
3. 设置 DEBUG=False
4. 配置 CORS_ORIGINS
5. 使用 Gunicorn + Uvicorn

```bash
gunicorn app.main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000
```

## 📝 待办事项

- [ ] 添加 AI 识别 API
- [ ] 添加知识图谱 API
- [ ] 添加购物车 API
- [ ] 添加订单 API
- [ ] 添加单元测试
- [ ] 添加 API 限流
- [ ] 添加日志系统
- [ ] 添加监控告警

## 📄 许可证

MIT License
