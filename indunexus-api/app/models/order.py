from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(50), unique=True, index=True, nullable=False)
    user_id = Column(String(50), ForeignKey("users.id"), nullable=False)  # Changed to String to match UUID stored as string
    status = Column(String(20), default="pending")  # pending, paid, shipped, completed, cancelled
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    paid_at = Column(DateTime, nullable=True)
    shipped_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    
    # Amounts
    subtotal = Column(Float, default=0.0)
    shipping_fee = Column(Float, default=0.0)
    discount = Column(Float, default=0.0)
    total_amount = Column(Float, default=0.0)
    
    # Shipping info
    receiver_name = Column(String(100))
    receiver_phone = Column(String(20))
    shipping_address = Column(Text)
    tracking_number = Column(String(100), nullable=True)
    
    # Invoice info
    need_invoice = Column(Integer, default=0)  # 0: No, 1: Yes
    invoice_title = Column(String(200), nullable=True)
    tax_number = Column(String(50), nullable=True)
    
    # Remark
    remark = Column(Text, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    
    # Part info (snapshot at order time)
    part_id = Column(String(50))
    part_name = Column(String(200))
    part_number = Column(String(100))
    manufacturer = Column(String(100), nullable=True)
    image_url = Column(String(500), nullable=True)
    
    # Order details
    quantity = Column(Integer, default=1)
    price = Column(Float, default=0.0)
    subtotal = Column(Float, default=0.0)
    
    # Relationship
    order = relationship("Order", back_populates="items")
