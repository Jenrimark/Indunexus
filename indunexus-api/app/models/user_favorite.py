"""
用户收藏模型
"""
from sqlalchemy import Column, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.core.database import Base


class UserFavorite(Base):
    """用户收藏表"""
    __tablename__ = "user_favorites"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    part_id = Column(UUID(as_uuid=True), ForeignKey("parts_spu.id", ondelete="CASCADE"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 关系
    user = relationship("User", back_populates="favorites")
    part = relationship("PartSPU", back_populates="favorites")
    
    # 唯一约束
    __table_args__ = (
        UniqueConstraint('user_id', 'part_id', name='uq_user_part_favorite'),
    )
