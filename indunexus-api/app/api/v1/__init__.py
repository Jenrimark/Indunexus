"""
API v1 路由
"""
from fastapi import APIRouter
from app.api.v1.endpoints import auth, parts_new, categories, orders, users

api_router = APIRouter()

# 注册路由
api_router.include_router(auth.router, prefix="/auth", tags=["认证"])
api_router.include_router(parts_new.router, prefix="/parts", tags=["零部件"])
api_router.include_router(categories.router, prefix="/categories", tags=["类目"])
api_router.include_router(orders.router, prefix="/orders", tags=["订单"])
api_router.include_router(users.router, prefix="/users", tags=["用户管理"])
