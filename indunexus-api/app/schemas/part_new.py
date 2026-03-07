"""
零部件相关的 Pydantic schemas (SPU/SKU 架构)
"""
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from decimal import Decimal


# ============ SKU Schemas ============

class PartSKUBase(BaseModel):
    """SKU 基础模型"""
    spu_id: str
    sku_code: str
    specifications: Dict[str, Any]
    price: Decimal
    currency: str = "CNY"
    stock: int = 0
    images: Optional[List[str]] = None
    model_3d_url: Optional[str] = None
    technical_drawing_url: Optional[str] = None
    
    class Config:
        protected_namespaces = ()


class PartSKUCreate(BaseModel):
    """创建 SKU"""
    spu_id: str
    sku_code: str
    specifications: Dict[str, Any]
    price: Decimal
    currency: Optional[str] = "CNY"
    stock: int = 0
    images: Optional[List[str]] = None
    model_3d_url: Optional[str] = None
    technical_drawing_url: Optional[str] = None
    
    class Config:
        protected_namespaces = ()


class PartSKUUpdate(BaseModel):
    """更新 SKU"""
    specifications: Optional[Dict[str, Any]] = None
    price: Optional[Decimal] = None
    currency: Optional[str] = None
    stock: Optional[int] = None
    images: Optional[List[str]] = None
    model_3d_url: Optional[str] = None
    technical_drawing_url: Optional[str] = None
    
    class Config:
        protected_namespaces = ()


class PartSKUInDB(PartSKUBase):
    """数据库中的 SKU"""
    id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
        protected_namespaces = ()


# ============ SPU Schemas ============

class PartSPUBase(BaseModel):
    """SPU 基础模型"""
    part_number: str
    oem_code: Optional[str] = None
    name: str
    name_en: Optional[str] = None
    category_id: str
    brand: Optional[str] = None
    description: Optional[str] = None


class PartSPUCreate(BaseModel):
    """创建 SPU"""
    part_number: str
    oem_code: Optional[str] = None
    name: str
    name_en: Optional[str] = None
    category_id: str
    brand: Optional[str] = None
    description: Optional[str] = None


class PartSPUUpdate(BaseModel):
    """更新 SPU"""
    name: Optional[str] = None
    name_en: Optional[str] = None
    oem_code: Optional[str] = None
    category_id: Optional[str] = None
    brand: Optional[str] = None
    description: Optional[str] = None


class PartSPUInDB(PartSPUBase):
    """数据库中的 SPU"""
    id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class PartSPUWithSKUs(PartSPUInDB):
    """SPU 包含所有 SKU"""
    skus: List[PartSKUInDB] = []
    
    class Config:
        from_attributes = True


# ============ 搜索相关 ============

class PartSearchParams(BaseModel):
    """搜索参数"""
    keyword: Optional[str] = None
    category_id: Optional[str] = None
    brand: Optional[str] = None
    min_price: Optional[Decimal] = None
    max_price: Optional[Decimal] = None
    in_stock: Optional[bool] = None
    page: int = 1
    page_size: int = 20


class PartSearchResult(BaseModel):
    """搜索结果"""
    total: int
    page: int
    page_size: int
    has_more: bool
    items: List[PartSPUWithSKUs]
