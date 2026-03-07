"""
AI 识别记录模型
"""
from sqlalchemy import Column, String, Integer, Numeric, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.core.database import Base


class AIRecognition(Base):
    """AI 识别记录表"""
    __tablename__ = "ai_recognitions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), index=True)
    image_url = Column(String(255), nullable=False)
    
    # 识别结果
    result_part_id = Column(UUID(as_uuid=True), ForeignKey("parts_spu.id"))
    confidence = Column(Numeric(3, 2))  # 0.00 - 1.00
    alternatives = Column(JSONB)  # Top 5 相似结果
    
    processing_time_ms = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 关系
    user = relationship("User", back_populates="ai_recognitions")
    part = relationship("PartSPU", back_populates="ai_recognitions")
