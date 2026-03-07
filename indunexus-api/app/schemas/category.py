"""
类目相关的 Pydantic schemas
"""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class CategoryBase(BaseModel):
    """类目基础模型"""
    name: str
    name_en: Optional[str] = None
    parent_id: Optional[str] = None
    level: int
    path: Optional[str] = None
    icon: Optional[str] = None
    sort_order: int = 0


class CategoryCreate(BaseModel):
    """创建类目"""
    name: str
    name_en: Optional[str] = None
    parent_id: Optional[str] = None
    icon: Optional[str] = None
    sort_order: Optional[int] = 0


class CategoryUpdate(BaseModel):
    """更新类目"""
    name: Optional[str] = None
    name_en: Optional[str] = None
    icon: Optional[str] = None
    sort_order: Optional[int] = None


class CategoryInDB(CategoryBase):
    """数据库中的类目"""
    id: str
    parts_count: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class CategoryTree(CategoryInDB):
    """类目树（包含子类目）"""
    children: List['CategoryTree'] = []
    
    class Config:
        from_attributes = True


# 解决循环引用
CategoryTree.model_rebuild()
