"""
常用选型模型
"""
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.core.database import Base


class UserPreset(Base):
    """常用选型表"""
    __tablename__ = "user_presets"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    name = Column(String(100), nullable=False)
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id"))
    filters = Column(JSONB, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 关系
    user = relationship("User", back_populates="presets")
