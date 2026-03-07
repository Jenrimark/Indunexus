"""
零部件相关 Schema
"""
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


class PartBase(BaseModel):
    """零部件基础信息"""
    part_number: str
    name: str
    category_id: str
    brand: Optional[str] = None
    description: Optional[str] = None


class PartCreate(PartBase):
    """创建零部件"""
    oem_code: Optional[str] = None
    name_en: Optional[str] = None
    images: Dict[str, Any]
    specifications: Dict[str, Any]
    price: float
    currency: str = "CNY"
    stock: int = 0


class PartResponse(PartBase):
    """零部件响应"""
    id: str
    oem_code: Optional[str] = None
    name_en: Optional[str] = None
    images: Dict[str, Any]
    specifications: Dict[str, Any]
    price: float
    currency: str
    stock: int
    model_3d_url: Optional[str] = None
    technical_drawing_url: Optional[str] = None
    compatible_vehicles: List[str]
    alternatives: List[str]
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class PartSearchRequest(BaseModel):
    """搜索请求"""
    keyword: Optional[str] = None
    type: Optional[str] = "auto"
    category_id: Optional[str] = None
    filters: Optional[Dict[str, Any]] = None
    sort_by: Optional[str] = "relevance"
    sort_order: Optional[str] = "desc"
    page: int = 1
    page_size: int = 20


class PartSearchResponse(BaseModel):
    """搜索响应"""
    parts: List[PartResponse]
    total: int
    page: int
    page_size: int
    has_more: bool
