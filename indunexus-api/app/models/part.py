"""
零部件模型 (SPU/SKU 分离)
"""
from sqlalchemy import Column, String, Integer, Numeric, Text, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.core.database import Base


class PartSPU(Base):
    """零部件 SPU 表 (Standard Product Unit)"""
    __tablename__ = "parts_spu"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    part_number = Column(String(50), unique=True, nullable=False, index=True)
    oem_code = Column(String(50))
    name = Column(String(200), nullable=False)
    name_en = Column(String(200))
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id"), index=True)
    brand = Column(String(100), index=True)
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关系
    category = relationship("Category", back_populates="parts")
    skus = relationship("PartSKU", back_populates="spu", cascade="all, delete-orphan")
    ai_recognitions = relationship("AIRecognition", back_populates="part")
    favorites = relationship("UserFavorite", back_populates="part", cascade="all, delete-orphan")


class PartSKU(Base):
    """零部件 SKU 表 (Stock Keeping Unit)"""
    __tablename__ = "parts_sku"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    spu_id = Column(UUID(as_uuid=True), ForeignKey("parts_spu.id", ondelete="CASCADE"), index=True)
    sku_code = Column(String(50), unique=True, nullable=False, index=True)
    
    # 使用 JSONB 存储动态参数
    specifications = Column(JSONB, nullable=False)
    """
    示例 specifications 结构：
    {
        "material": "轴承钢",
        "dimensions": {
            "innerDiameter": 25,
            "outerDiameter": 52,
            "width": 15,
            "unit": "mm"
        },
        "weight": {
            "value": 0.15,
            "unit": "kg"
        },
        "tolerance": "P5",
        "sealType": "密封圈"
    }
    """
    
    price = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(3), default="CNY")
    stock = Column(Integer, default=0)
    
    # 图片和模型
    images = Column(JSONB)  # ["url1", "url2", ...]
    model_3d_url = Column(String(255))
    technical_drawing_url = Column(String(255))
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关系
    spu = relationship("PartSPU", back_populates="skus")
    cart_items = relationship("ShoppingCart", back_populates="sku", cascade="all, delete-orphan")
