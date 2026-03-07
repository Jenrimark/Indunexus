from pydantic import BaseModel, field_serializer
from typing import List, Optional
from datetime import datetime
from uuid import UUID


class OrderItemBase(BaseModel):
    part_id: str
    part_name: str
    part_number: str
    manufacturer: Optional[str] = None
    image_url: Optional[str] = None
    quantity: int
    price: float


class OrderItemCreate(OrderItemBase):
    pass


class OrderItem(OrderItemBase):
    id: int
    order_id: int
    subtotal: float

    class Config:
        from_attributes = True


class OrderBase(BaseModel):
    receiver_name: str
    receiver_phone: str
    shipping_address: str
    need_invoice: bool = False
    invoice_title: Optional[str] = None
    tax_number: Optional[str] = None
    remark: Optional[str] = None


class OrderCreate(OrderBase):
    items: List[OrderItemCreate]


class Order(OrderBase):
    id: int
    order_number: str
    user_id: str
    status: str
    created_at: datetime
    paid_at: Optional[datetime] = None
    shipped_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    subtotal: float
    shipping_fee: float
    discount: float
    total_amount: float
    tracking_number: Optional[str] = None
    items: List[OrderItem] = []

    @field_serializer('user_id')
    def serialize_user_id(self, user_id: any) -> str:
        """Convert UUID to string"""
        return str(user_id)

    class Config:
        from_attributes = True


class OrderUpdate(BaseModel):
    status: Optional[str] = None
    tracking_number: Optional[str] = None
    paid_at: Optional[datetime] = None
    shipped_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
