"""
采购清单模型
"""
from sqlalchemy import Column, Integer, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.core.database import Base


class ShoppingCart(Base):
    """采购清单表"""
    __tablename__ = "shopping_cart"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    sku_id = Column(UUID(as_uuid=True), ForeignKey("parts_sku.id", ondelete="CASCADE"))
    quantity = Column(Integer, nullable=False, default=1)
    added_at = Column(DateTime, default=datetime.utcnow)
    
    # 关系
    user = relationship("User", back_populates="cart_items")
    sku = relationship("PartSKU", back_populates="cart_items")
    
    # 唯一约束
    __table_args__ = (
        UniqueConstraint('user_id', 'sku_id', name='uq_user_sku_cart'),
    )
