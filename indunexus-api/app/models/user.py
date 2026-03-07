"""
用户模型
"""
from sqlalchemy import Column, String, DateTime, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.core.database import Base


class User(Base):
    """用户表"""
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), default="buyer")  # admin, supplier, buyer
    avatar = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    
    # 供应商专属字段
    company_name = Column(String(100), nullable=True)  # 公司名称
    company_description = Column(String(500), nullable=True)  # 公司简介
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关系 - 使用字符串引用避免循环导入
    ai_recognitions = relationship("AIRecognition", back_populates="user", cascade="all, delete-orphan")
    favorites = relationship("UserFavorite", back_populates="user", cascade="all, delete-orphan")
    presets = relationship("UserPreset", back_populates="user", cascade="all, delete-orphan")
    cart_items = relationship("ShoppingCart", back_populates="user", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="user", cascade="all, delete-orphan")
