"""
类目模型
"""
from sqlalchemy import Column, String, Integer, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.core.database import Base


class Category(Base):
    """类目表"""
    __tablename__ = "categories"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    name_en = Column(String(100))
    parent_id = Column(UUID(as_uuid=True), ForeignKey("categories.id"))
    level = Column(Integer, nullable=False)
    path = Column(String(500))  # 如：/power/transmission/bearing
    icon = Column(String(50))
    parts_count = Column(Integer, default=0)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 关系
    children = relationship("Category", backref="parent", remote_side=[id])
    parts = relationship("PartSPU", back_populates="category")
