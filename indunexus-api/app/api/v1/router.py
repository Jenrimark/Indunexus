"""
API v1 路由汇总
"""
from fastapi import APIRouter
from app.api.v1.endpoints import auth, parts_new, categories

api_router = APIRouter()

# 注册各模块路由
api_router.include_router(auth.router, prefix="/auth", tags=["认证"])
api_router.include_router(parts_new.router, prefix="/parts", tags=["零部件"])
api_router.include_router(categories.router, prefix="/categories", tags=["类目"])
